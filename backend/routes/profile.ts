import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { hashPassword } from "../hash/hashPassword.js";
import bcrypt from "bcrypt";
import { validateProfileUpdate } from "../helpers/validateProfileUpdate.js";
import { sendVerificationEmail } from "../email/sendVerificationEmail.js";
import { ErrorMessages, SuccessMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

// GET /profile/info - Get user profile
router.get("/info", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const result = await pool.query(
            `SELECT id, user_name, current_location, bio, created_at, updated_at, last_login 
             FROM users 
             WHERE id = $1`,
            [userId],
        );

        if (result.rows.length === 0) {
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const user = result.rows[0];

        const categoriesResult = await pool.query(
            `SELECT c.id, c.name
             FROM category c
             INNER JOIN users_categories uc ON c.id = uc.category_id
             WHERE uc.users_id = $1
             ORDER BY c.name`,
            [userId],
        );

        sendSuccess(res, 200, "", {
            user: {
                id: user.id,
                userName: user.user_name,
                currentLocation: user.current_location,
                bio: user.bio,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
                lastLogin: user.last_login,
                categories: categoriesResult.rows.map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                })),
            },
        });
    } catch (error) {
        console.error("Profile error:", error);
        sendError(res, 500, ErrorMessages.PROFILE_FETCH_FAILED);
    }
});

// PUT /profile/edit/password - Change password
router.put("/edit/password", authenticateToken, async (req: Request, res: Response) => {
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

// PUT /profile/edit/email - Change email address
router.put("/edit/email", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { oldEmail, newEmail } = req.body;
        const userId = (req as any).user.userId;

        if (!oldEmail || !newEmail) {
            return sendError(res, 400, ErrorMessages.EMAIL_REQUIRED);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return sendError(res, 400, ErrorMessages.EMAIL_INVALID);
        }

        const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);

        if (userResult.rows.length === 0) {
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const currentEmail = userResult.rows[0].email;

        if (oldEmail !== currentEmail) {
            return sendError(res, 401, ErrorMessages.EMAIL_INCORRECT);
        }

        // Check if new email is already in use
        const emailExists = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [newEmail, userId]);

        if (emailExists.rows.length > 0) {
            return sendError(res, 409, ErrorMessages.USER_EXISTS);
        }

        // Generate verification token and send email
        const verificationToken = await sendVerificationEmail(newEmail);
        const tokenExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Update email and reset verification status
        await pool.query(
            `UPDATE users 
             SET email = $1, 
                 email_verified = false, 
                 verification_token = $2, 
                 verification_token_expires = $3, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4`,
            [newEmail, verificationToken, tokenExpires, userId],
        );

        sendSuccess(res, 200, SuccessMessages.EMAIL_UPDATED);
    } catch (error) {
        console.error("Email change error:", error);
        sendError(res, 500, ErrorMessages.EMAIL_UPDATE_FAILED);
    }
});

// PUT /profile/edit/info - Update user profile
router.put("/edit/info", authenticateToken, async (req: Request, res: Response) => {
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
                const categoryCheck = await client.query("SELECT id, name FROM category WHERE name = ANY($1)", [categories]);

                if (categoryCheck.rows.length !== categories.length) {
                    await client.query("ROLLBACK");
                    const validCategories = categoryCheck.rows.map((c: any) => c.name);
                    const invalidCategories = categories.filter((categoryName: string) => !validCategories.includes(categoryName));
                    return sendError(res, 400, ErrorMessages.INVALID_CATEGORIES, undefined, invalidCategories);
                }

                await client.query("DELETE FROM users_categories WHERE users_id = $1", [userId]);

                const categoryIds = categoryCheck.rows.map((c: any) => c.id);

                await client.query(
                    `INSERT INTO users_categories (users_id, category_id) 
                     SELECT $1, unnest($2::int[])`,
                    [userId, categoryIds],
                );
            } else {
                await client.query("DELETE FROM users_categories WHERE users_id = $1", [userId]);
            }
        }

        const userResult = await client.query(
            `SELECT u.id, u.email, u.user_name, u.current_location, u.bio, u.updated_at,
                    COALESCE(
                        json_agg(c.name) FILTER (WHERE c.name IS NOT NULL),
                        '[]'::json
                    ) as category
             FROM users u
             LEFT JOIN users_categories uc ON u.id = uc.users_id
             LEFT JOIN category c ON uc.category_id = c.id
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
                categories: updatedUser.category,
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
