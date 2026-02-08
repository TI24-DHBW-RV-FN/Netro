import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { comparePassword } from "../hash/comparePassword.js";
import { generateToken } from "../token/generateToken.js";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        const result = await pool.query("SELECT id, email, password_hash, user_name, current_location, bio FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const user = result.rows[0];

        const isValidPassword = await comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
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

        res.status(200).json({
            success: true,
            message: "Login successful",
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
        res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
});

export default router;
