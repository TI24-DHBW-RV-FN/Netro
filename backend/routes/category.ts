import { Router, Request, Response } from "express";
import { authenticateToken } from "../token/authenticateToken.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");

        res.status(200).json({
            success: true,
            categories: result.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Request failed",
        });
    }
});

export default router;
