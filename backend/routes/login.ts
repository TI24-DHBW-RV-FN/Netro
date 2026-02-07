import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { comparePassword } from "../hash/comparePassword.js";
import { generateToken } from "../auth/generateToken.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Find user by email
        const result = await pool.query("SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const user = result.rows[0];

        // Compare password
        const isValidPassword = await comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Update last_login
        await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);

        // Generate JWT token
        const token = generateToken(user.id, user.email, process.env.JWT_SECRET!);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
            },
        });

        // res.json({
        //     success: true,
        //     message: "Login successful",
        //     token,
        //     user: {
        //         id: user.id,
        //         email: user.email,
        //         firstName: user.first_name,
        //         lastName: user.last_name,
        //     },
        // });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
});

export default router;
