import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { ErrorMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

router.get("/", authenticateToken, async (req: Request, res: Response) => {
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
             FROM categories c
             INNER JOIN user_categories uc ON c.id = uc.category_id
             WHERE uc.user_id = $1
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

export default router;
