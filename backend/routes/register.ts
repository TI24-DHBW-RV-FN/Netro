import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { hashPassword } from "../hash/hashPassword.js";
import { generateToken } from "../token/generateToken.js";
import { validateRegistrationInput } from "../helpers/validateRegistrationInput.js";
import { sendVerificationEmail } from "../email/sendVerificationEmail.js";
import { ErrorMessages, SuccessMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const validation = validateRegistrationInput(req.body);
        if (!validation.valid) {
            return sendError(res, 400, ErrorMessages.VALIDATION_FAILED, validation.errors);
        }

        const { email, password, userName, currentLocation, bio, categories } = req.body;

        await client.query("BEGIN");

        const userExists = await client.query("SELECT id FROM users WHERE email = $1", [email]);

        if (userExists.rows.length > 0) {
            await client.query("ROLLBACK");
            return sendError(res, 409, ErrorMessages.USER_EXISTS);
        }

        const passwordHash = await hashPassword(password);
        const verificationToken = await sendVerificationEmail(email);
        const tokenExpires = new Date(Date.now() + 5 * 60 * 1000);
        const result = await client.query(
            `INSERT INTO users (email, password_hash, user_name, current_location, bio, email_verified, verification_token, verification_token_expires) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id, email, user_name, current_location, bio, created_at`,
            [email, passwordHash, userName, currentLocation || null, bio || null, false, verificationToken, tokenExpires],
        );

        const newUser = result.rows[0];

        if (categories && categories.length > 0) {
            const categoryCheck = await client.query("SELECT id, name FROM categories WHERE name = ANY($1)", [categories]);

            if (categoryCheck.rows.length !== categories.length) {
                await client.query("ROLLBACK");
                const validCategories = categoryCheck.rows.map((c) => c.name);
                const invalidCategories = categories.filter((categoryName: string) => !validCategories.includes(categoryName));
                return sendError(res, 400, ErrorMessages.INVALID_CATEGORIES, undefined, invalidCategories);
            }

            const categoryIds = categoryCheck.rows.map((c) => c.id);

            await client.query(
                `INSERT INTO user_categories (user_id, category_id) 
                 SELECT $1, unnest($2::int[])`,
                [newUser.id, categoryIds],
            );
        }

        await client.query("COMMIT");

        const token = generateToken(newUser.id, newUser.email, process.env.JWT_SECRET!);

        sendSuccess(res, 201, SuccessMessages.REGISTRATION_SUCCESS, {
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
        sendError(res, 500, ErrorMessages.REGISTRATION_FAILED);
    } finally {
        client.release();
    }
});

export default router;
