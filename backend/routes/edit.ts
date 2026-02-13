import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { hashPassword } from "../hash/hashPassword.js";
import bcrypt from "bcrypt";
import { validateProfileUpdate } from "../helpers/validateProfileUpdate.js";
import { ErrorMessages, SuccessMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

router.put("/password", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = (req as any).user.userId;

        if (!oldPassword || !newPassword) {
            return sendError(res, 400, ErrorMessages.PASSWORD_REQUIRED);
        }

        if (newPassword.length < 8) {
            return sendError(res, 400, ErrorMessages.PASSWORD_TOO_SHORT);
        }

        const userResult = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);

        if (userResult.rows.length === 0) {
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const currentPasswordHash = userResult.rows[0].password_hash;

        const isPasswordValid = await bcrypt.compare(oldPassword, currentPasswordHash);

        if (!isPasswordValid) {
            return sendError(res, 401, ErrorMessages.PASSWORD_INCORRECT);
        }

        const newPasswordHash = await hashPassword(newPassword);

        await pool.query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newPasswordHash, userId]);

        sendSuccess(res, 200, SuccessMessages.PASSWORD_UPDATED);
    } catch (error) {
        console.error("Password change error:", error);
        sendError(res, 500, ErrorMessages.PASSWORD_UPDATE_FAILED);
    }
});

router.put("/email", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { oldEmail, newEmail } = req.body;
        const userId = (req as any).user.userId;

        if (!oldEmail || !newEmail) {
            return sendError(res, 400, ErrorMessages.EMAIL_REQUIRED);
        }

        const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);

        if (userResult.rows.length === 0) {
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const currentEmail = userResult.rows[0].email;

        if (oldEmail !== currentEmail) {
            return sendError(res, 401, ErrorMessages.EMAIL_INCORRECT);
        }

        await pool.query("UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newEmail, userId]);

        sendSuccess(res, 200, SuccessMessages.EMAIL_UPDATED);
    } catch (error) {
        console.error("Email change error:", error);
        sendError(res, 500, ErrorMessages.EMAIL_UPDATE_FAILED);
    }
});

router.put("/profile", authenticateToken, async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const userId = (req as any).user.userId;
        const { userName, currentLocation, bio, categories } = req.body;

        const validation = validateProfileUpdate(req.body);
        if (!validation.valid) {
            return sendError(res, 400, ErrorMessages.VALIDATION_FAILED, validation.errors);
        }

        if (userName === undefined && currentLocation === undefined && bio === undefined && categories === undefined) {
            return sendError(res, 400, ErrorMessages.NO_FIELDS_PROVIDED);
        }

        await client.query("BEGIN");

        const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [userId]);

        if (userCheck.rows.length === 0) {
            await client.query("ROLLBACK");
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCount = 1;

        if (userName !== undefined) {
            updateFields.push(`user_name = $${paramCount}`);
            updateValues.push(userName);
            paramCount++;
        }

        if (currentLocation !== undefined) {
            updateFields.push(`current_location = $${paramCount}`);
            updateValues.push(currentLocation);
            paramCount++;
        }

        if (bio !== undefined) {
            updateFields.push(`bio = $${paramCount}`);
            updateValues.push(bio);
            paramCount++;
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(userId);

        if (updateFields.length > 1) {
            const updateQuery = `
                UPDATE users 
                SET ${updateFields.join(", ")} 
                WHERE id = $${paramCount} 
                `;

            await client.query(updateQuery, updateValues);
        }

        if (categories !== undefined && Array.isArray(categories)) {
            if (categories.length > 0) {
                const categoryCheck = await client.query("SELECT id, name FROM categories WHERE name = ANY($1)", [categories]);

                if (categoryCheck.rows.length !== categories.length) {
                    await client.query("ROLLBACK");
                    const validCategories = categoryCheck.rows.map((c: any) => c.name);
                    const invalidCategories = categories.filter((categoryName: string) => !validCategories.includes(categoryName));
                    return sendError(res, 400, ErrorMessages.INVALID_CATEGORIES, undefined, invalidCategories);
                }

                await client.query("DELETE FROM user_categories WHERE user_id = $1", [userId]);

                const categoryIds = categoryCheck.rows.map((c: any) => c.id);

                await client.query(
                    `INSERT INTO user_categories (user_id, category_id) 
                     SELECT $1, unnest($2::int[])`,
                    [userId, categoryIds],
                );
            } else {
                await client.query("DELETE FROM user_categories WHERE user_id = $1", [userId]);
            }
        }

        const userResult = await client.query(
            `SELECT u.id, u.email, u.user_name, u.current_location, u.bio, u.updated_at,
                    COALESCE(
                        json_agg(c.name) FILTER (WHERE c.name IS NOT NULL),
                        '[]'::json
                    ) as categories
             FROM users u
             LEFT JOIN user_categories uc ON u.id = uc.user_id
             LEFT JOIN categories c ON uc.category_id = c.id
             WHERE u.id = $1
             GROUP BY u.id`,
            [userId],
        );

        await client.query("COMMIT");

        const updatedUser = userResult.rows[0];

        sendSuccess(res, 200, SuccessMessages.PROFILE_UPDATED, {
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                userName: updatedUser.user_name,
                currentLocation: updatedUser.current_location,
                bio: updatedUser.bio,
                categories: updatedUser.categories,
                updatedAt: updatedUser.updated_at,
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Profile update error:", error);
        sendError(res, 500, ErrorMessages.PROFILE_UPDATE_FAILED);
    } finally {
        client.release();
    }
});

export default router;
