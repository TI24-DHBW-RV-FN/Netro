import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { ErrorMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");

        sendSuccess(res, 200, "", {
            categories: result.rows,
        });
    } catch (err) {
        console.error(err);
        sendError(res, 500, ErrorMessages.REQUEST_FAILED);
    }
});

export default router;
