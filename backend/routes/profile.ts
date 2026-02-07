import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../auth/authenticateToken.js";

const router = Router();

// Protected route - requires JWT token
router.get("/", authenticateToken, async (req: Request, res: Response) => {
    try {
        // req.user is now typed thanks to types/express.d.ts
        const userId = req.user!.userId;

        // Fetch user from database
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, created_at, last_login 
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
                firstName: user.first_name,
                lastName: user.last_name,
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
