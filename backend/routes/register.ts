import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { hashPassword } from "../hash/hashPassword.js";
import { generateToken } from "../auth/generateToken.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validate input
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "Email, password, first and last name are required",
            });
        }

        // Check if user already exists
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if (userExists.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Hash password

        const passwordHash = await hashPassword(password);

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, first_name, last_name, created_at`,
            [email, passwordHash, firstName || null, lastName || null],
        );

        const newUser = result.rows[0];

        const token = generateToken(newUser.id, newUser.email, process.env.JWT_SECRET!);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                createdAt: newUser.created_at,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
});

export default router;
