import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";

const router = Router();

router.get("/", authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const result = await pool.query(
            `SELECT id, email, user_name, current_location, bio, created_at, last_login 
             FROM users 
             WHERE id = $1`,
            [userId],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = result.rows[0];

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                userName: user.user_name,
                currentLocation: user.current_location,
                bio: user.bio,
                createdAt: user.created_at,
                lastLogin: user.last_login,
            },
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile",
        });
    }
});

export default router;
