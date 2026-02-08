import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { hashPassword } from "../hash/hashPassword.js";
import bcrypt from "bcrypt";
import { validateProfileUpdate } from "../helpers/validateProfileUpdate.js";

const router = Router();

router.post("/password", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = (req as any).user.userId;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long",
            });
        }

        const userResult = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const currentPasswordHash = userResult.rows[0].password_hash;

        const isPasswordValid = await bcrypt.compare(oldPassword, currentPasswordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const newPasswordHash = await hashPassword(newPassword);

        await pool.query("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newPasswordHash, userId]);

        res.json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update password",
        });
    }
});

router.post("/email", authenticateToken, async (req: Request, res: Response) => {
    try {
        const { oldEmail, newEmail } = req.body;
        const userId = (req as any).user.userId;

        if (!oldEmail || !newEmail) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required",
            });
        }

        const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const currentEmail = userResult.rows[0].email;

        if (oldEmail !== currentEmail) {
            return res.status(401).json({
                success: false,
                message: "Current email is incorrect",
            });
        }

        // verify new email
        // verify new email
        // verify new email
        // verify new email
        // verify new email

        await pool.query("UPDATE users SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newEmail, userId]);

        res.json({
            success: true,
            message: "Email updated successfully",
        });
    } catch (error) {
        console.error("Email change error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update email",
        });
    }
});

router.post("/profile", authenticateToken, async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const userId = (req as any).user.userId;
        const { userName, currentLocation, bio, categories } = req.body;

        // Validate input
        const validation = validateProfileUpdate(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors,
            });
        }

        // Check if at least one field is provided
        if (userName === undefined && currentLocation === undefined && bio === undefined && categories === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided to update",
            });
        }

        await client.query("BEGIN");

        // Check if user exists
        const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [userId]);

        if (userCheck.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Build dynamic UPDATE query for user fields
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

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        // Add userId as the last parameter
        updateValues.push(userId);

        // Update user table if there are fields to update
        if (updateFields.length > 1) {
            // > 1 because updated_at is always included
            const updateQuery = `
                UPDATE users 
                SET ${updateFields.join(", ")} 
                WHERE id = $${paramCount} 
                `;

            await client.query(updateQuery, updateValues);
        }
        // $x this represents the indices of the Values that are in updateValues. updateValues last Value will always be the User Id
        // Handle categories update
        if (categories !== undefined && Array.isArray(categories)) {
            // Validate categories exist
            if (categories.length > 0) {
                const categoryCheck = await client.query("SELECT id, name FROM categories WHERE name = ANY($1)", [categories]);

                if (categoryCheck.rows.length !== categories.length) {
                    await client.query("ROLLBACK");
                    const validCategories = categoryCheck.rows.map((c: any) => c.name);
                    const invalidCategories = categories.filter((categoryName: string) => !validCategories.includes(categoryName));
                    return res.status(400).json({
                        success: false,
                        message: "Invalid categories provided",
                        invalidCategories,
                    });
                }

                // Delete existing categories
                await client.query("DELETE FROM user_categories WHERE user_id = $1", [userId]);

                // Insert new categories
                const categoryIds = categoryCheck.rows.map((c: any) => c.id);
                const insertValues = categoryIds.map((catId: any) => `(${userId}, ${catId})`).join(", ");

                await client.query(`INSERT INTO user_categories (user_id, category_id) VALUES ${insertValues}`);
            } else {
                // If empty array, remove all categories
                await client.query("DELETE FROM user_categories WHERE user_id = $1", [userId]);
            }
        }

        // Fetch updated user data with categories
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

        res.json({
            success: true,
            message: "Profile updated successfully",
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
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    } finally {
        client.release();
    }
});

export default router;
