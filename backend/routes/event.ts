import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { ErrorMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

router.post("/create", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { title, description, startTime, location, seriesEvent, frequency, categories } = req.body;

        const errors: string[] = [];
        if (!title) errors.push("Title is required");
        if (!description) errors.push("Description is required");
        if (!startTime) errors.push("Start time is required");
        if (!location) errors.push("Location is required");

        if (errors.length > 0) {
            return sendError(res, 400, ErrorMessages.VALIDATION_FAILED, errors);
        }

        const startTimeDate = new Date(startTime);
        if (isNaN(startTimeDate.getTime())) {
            return sendError(res, 400, ErrorMessages.VALIDATION_FAILED, ["Invalid start time format"]);
        }

        const userResult = await pool.query(`SELECT id FROM users WHERE id = $1`, [userId]);

        if (userResult.rows.length === 0) {
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const eventResult = await pool.query(
            `INSERT INTO events (
                title, 
                description, 
                start_time, 
                location, 
                series_event, 
                frequency, 
                created_by_user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, title, description, start_time, location, series_event, frequency, created_at, updated_at, created_by_user_id`,
            [title, description, startTimeDate, location, seriesEvent || false, (seriesEvent ? frequency : null) || null, userId],
        );

        const eventData = eventResult.rows[0];

        console.log("✅ Event created successfully:", {
            eventId: eventData.id,
            title: eventData.title,
            createdBy: userId,
            startTime: eventData.start_time,
        });

        if (categories && Array.isArray(categories) && categories.length > 0) {
            const validCategoriesResult = await pool.query(`SELECT id, name FROM category WHERE name = ANY($1::text[])`, [categories]);

            const validCategoryNames = validCategoriesResult.rows.map((cat: any) => cat.name);
            const invalidCategories = categories.filter((cat: string) => !validCategoryNames.includes(cat));

            if (invalidCategories.length > 0) {
                await pool.query(`DELETE FROM events WHERE id = $1`, [eventData.id]);
                return sendError(res, 400, ErrorMessages.INVALID_CATEGORIES, undefined, invalidCategories);
            }

            const categoryIds = validCategoriesResult.rows.map((cat: any) => cat.id);
            for (const categoryId of categoryIds) {
                await pool.query(`INSERT INTO events_categories (events_id, category_id) VALUES ($1, $2)`, [eventData.id, categoryId]);
            }
        }

        return sendSuccess(res, 201, "Event created successfully", {
            event: {
                id: eventData.id,
                title: eventData.title,
                description: eventData.description,
                startTime: eventData.start_time,
                location: eventData.location,
                seriesEvent: eventData.series_event,
                frequency: eventData.frequency,
                createdAt: eventData.created_at,
                updatedAt: eventData.updated_at,
                createdByUserId: eventData.created_by_user_id,
                categories: categories || [],
            },
        });
    } catch (error) {
        console.error("Event creation error:", error);
        return sendError(res, 500, "Failed to create event");
    }
});

router.put("/edit", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { eventId, title, description, startTime, location, seriesEvent, frequency, categories } = req.body;

        if (!eventId) {
            return sendError(res, 400, ErrorMessages.VALIDATION_FAILED, ["Event ID is required"]);
        }

        const eventCheckResult = await pool.query(`SELECT id, created_by_user_id FROM events WHERE id = $1`, [eventId]);

        if (eventCheckResult.rows.length === 0) {
            return sendError(res, 404, "Event not found");
        }

        const existingEvent = eventCheckResult.rows[0];
        if (existingEvent.created_by_user_id !== userId) {
            return sendError(res, 403, "You do not have permission to edit this event");
        }

        if (!title && !description && !startTime && !location && seriesEvent === undefined && !frequency && !categories) {
            return sendError(res, 400, ErrorMessages.NO_FIELDS_PROVIDED);
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }

        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description);
        }

        if (startTime !== undefined) {
            const startTimeDate = new Date(startTime);
            if (isNaN(startTimeDate.getTime())) {
                return sendError(res, 400, ErrorMessages.VALIDATION_FAILED, ["Invalid start time format"]);
            }
            updates.push(`start_time = $${paramCount++}`);
            values.push(startTimeDate);
        }

        if (location !== undefined) {
            updates.push(`location = $${paramCount++}`);
            values.push(location);
        }

        if (seriesEvent !== undefined) {
            updates.push(`series_event = $${paramCount++}`);
            values.push(seriesEvent);

            if (seriesEvent === false) {
                updates.push(`frequency = $${paramCount++}`);
                values.push(null);
            }
        }

        if (frequency !== undefined) {
            updates.push(`frequency = $${paramCount++}`);
            values.push(frequency);
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        values.push(eventId);

        let eventData;
        if (updates.length > 1) {
            const updateQuery = `
                UPDATE events 
                SET ${updates.join(", ")}
                WHERE id = $${paramCount}
                RETURNING id, title, description, start_time, location, series_event, frequency, created_at, updated_at, created_by_user_id
            `;

            const eventResult = await pool.query(updateQuery, values);
            eventData = eventResult.rows[0];
        } else {
            const eventResult = await pool.query(
                `SELECT id, title, description, start_time, location, series_event, frequency, created_at, updated_at, created_by_user_id
                FROM events WHERE id = $1`,
                [eventId],
            );
            eventData = eventResult.rows[0];
        }

        let eventCategories: string[] = [];
        if (categories !== undefined) {
            if (Array.isArray(categories)) {
                await pool.query(`DELETE FROM events_categories WHERE events_id = $1`, [eventId]);

                if (categories.length > 0) {
                    const validCategoriesResult = await pool.query(`SELECT id, name FROM category WHERE name = ANY($1::text[])`, [categories]);

                    const validCategoryNames = validCategoriesResult.rows.map((cat: any) => cat.name);
                    const invalidCategories = categories.filter((cat: string) => !validCategoryNames.includes(cat));

                    if (invalidCategories.length > 0) {
                        return sendError(res, 400, ErrorMessages.INVALID_CATEGORIES, undefined, invalidCategories);
                    }

                    const categoryIds = validCategoriesResult.rows.map((cat: any) => cat.id);
                    for (const categoryId of categoryIds) {
                        await pool.query(`INSERT INTO events_categories (events_id, category_id) VALUES ($1, $2)`, [eventId, categoryId]);
                    }

                    eventCategories = validCategoryNames;
                }
            } else {
                return sendError(res, 400, ErrorMessages.VALIDATION_FAILED, ["Categories must be an array"]);
            }
        } else {
            const existingCategoriesResult = await pool.query(
                `SELECT c.name FROM category c
                INNER JOIN events_categories ec ON c.id = ec.category_id
                WHERE ec.events_id = $1`,
                [eventId],
            );
            eventCategories = existingCategoriesResult.rows.map((cat: any) => cat.name);
        }

        console.log("✅ Event updated successfully:", {
            eventId: eventData.id,
            title: eventData.title,
            updatedBy: userId,
        });

        return sendSuccess(res, 200, "Event updated successfully", {
            event: {
                id: eventData.id,
                title: eventData.title,
                description: eventData.description,
                startTime: eventData.start_time,
                location: eventData.location,
                seriesEvent: eventData.series_event,
                frequency: eventData.frequency,
                createdAt: eventData.created_at,
                updatedAt: eventData.updated_at,
                createdByUserId: eventData.created_by_user_id,
                categories: eventCategories,
            },
        });
    } catch (error) {
        console.error("Event update error:", error);
        return sendError(res, 500, "Failed to update event");
    }
});

export default router;
