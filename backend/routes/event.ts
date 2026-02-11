import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";

const router = Router();

router.post("/create", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const userResult = await pool.query(
            `SELECT id, user_name, current_location 
            FROM users 
            WHERE id = $1`,
            [userId],
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = userResult.rows[0];

        const categoriesResult = await pool.query(
            `SELECT c.id, c.name
            FROM categories c
            INNER JOIN user_categories uc ON c.id = uc.category_id
            WHERE uc.user_id = $1
            ORDER BY c.name`,
            [userId],
        );
        [];

        const userCategories: string[] = categoriesResult.rows;

        console.log(user, userCategories);

        res.status(200).json({
            success: true,
            message: "success",
        });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create Event",
        });
    }
});

export default router;
