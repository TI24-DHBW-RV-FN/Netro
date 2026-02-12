import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { comparePassword } from "../hash/comparePassword.js";
import { generateToken } from "../token/generateToken.js";
import { ErrorMessages, SuccessMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 400, ErrorMessages.EMAIL_PASSWORD_REQUIRED);
        }

        if (!EMAIL_REGEX.test(email)) {
            return sendError(res, 400, ErrorMessages.INVALID_EMAIL_FORMAT);
        }

        const result = await pool.query("SELECT id, email, password_hash, user_name, current_location, bio FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return sendError(res, 401, ErrorMessages.INVALID_CREDENTIALS);
        }

        const user = result.rows[0];

        const isValidPassword = await comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            return sendError(res, 401, ErrorMessages.INVALID_CREDENTIALS);
        }

        await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

        const categoriesResult = await pool.query(
            `SELECT c.name 
             FROM categories c
             INNER JOIN user_categories uc ON c.id = uc.category_id
             WHERE uc.user_id = $1`,
            [user.id],
        );

        const categories = categoriesResult.rows.map((row) => row.name);
        const token = generateToken(user.id, user.email, process.env.JWT_SECRET!);

        sendSuccess(res, 200, SuccessMessages.LOGIN_SUCCESS, {
            token,
            user: {
                id: user.id,
                email: user.email,
                userName: user.user_name,
                currentLocation: user.current_location,
                bio: user.bio,
                categories: categories,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        sendError(res, 500, ErrorMessages.LOGIN_FAILED);
    }
});

export default router;
