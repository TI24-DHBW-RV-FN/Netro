import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { hashPassword } from "../hash/hashPassword.js";
import { generateToken } from "../auth/generateToken.js";
import { validateAllUserInput } from "../helpers/validateAllUserInput.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const validation = validateAllUserInput(req.body);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.errors,
            });
        }

        const { email, password, userName, currentLocation, bio, categories } = req.body;

        await client.query("BEGIN");

        const userExists = await client.query("SELECT id FROM users WHERE email = $1", [email]);

        if (userExists.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        const passwordHash = await hashPassword(password);

        const result = await client.query(
            `INSERT INTO users (email, password_hash, user_name, current_location, bio) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, email, user_name, current_location, bio, created_at`,
            [email, passwordHash, userName || null, currentLocation || null, bio || null],
        );

        const newUser = result.rows[0];

        if (categories && categories.length > 0) {
            const categoryCheck = await client.query("SELECT id, name FROM categories WHERE name = ANY($1)", [categories]);

            if (categoryCheck.rows.length !== categories.length) {
                await client.query("ROLLBACK");
                const validCategories = categoryCheck.rows.map((c) => c.name);
                const invalidCategories = categories.filter((categoryName: string) => !validCategories.includes(categoryName));
                return res.status(400).json({
                    success: false,
                    message: "Invalid categories provided",
                    invalidCategories,
                });
            }

            const categoryIds = categoryCheck.rows.map((c) => c.id);
            const insertValues = categoryIds.map((catId) => `(${newUser.id}, ${catId})`).join(", ");

            await client.query(`INSERT INTO user_categories (user_id, category_id) VALUES ${insertValues}`);
        }

        await client.query("COMMIT");

        const token = generateToken(newUser.id, newUser.email, process.env.JWT_SECRET!);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                userName: newUser.user_name,
                currentLocation: newUser.current_location,
                bio: newUser.bio,
                categories: categories || [],
                createdAt: newUser.created_at,
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    } finally {
        client.release();
    }
});

export default router;
