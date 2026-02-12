import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { sendVerificationEmail } from "../email/sendVerificationEmail.js";
import { ErrorMessages, SuccessMessages, sendError, sendSuccess } from "../helpers/ErrorMessages.js";

const router = Router();

router.post("/email", authenticateToken, async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const { verificationToken } = req.body;
        const userId = (req as any).user.userId;

        if (!verificationToken) {
            return sendError(res, 400, ErrorMessages.VERIFICATION_TOKEN_REQUIRED);
        }

        await client.query("BEGIN");

        const userResult = await client.query(
            "SELECT id, email, email_verified, verification_token, verification_token_expires FROM users WHERE id = $1",
            [userId],
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const user = userResult.rows[0];

        if (user.email_verified) {
            await client.query("ROLLBACK");
            return sendError(res, 400, ErrorMessages.EMAIL_ALREADY_VERIFIED);
        }

        if (!user.verification_token) {
            await client.query("ROLLBACK");
            return sendError(res, 400, ErrorMessages.NO_VERIFICATION_TOKEN);
        }

        if (user.verification_token !== verificationToken) {
            await client.query("ROLLBACK");
            return sendError(res, 400, ErrorMessages.INVALID_VERIFICATION_TOKEN);
        }

        const now = new Date();
        const expiresAt = new Date(user.verification_token_expires);

        if (now > expiresAt) {
            await client.query("ROLLBACK");
            return sendError(res, 400, ErrorMessages.VERIFICATION_TOKEN_EXPIRED);
        }

        await client.query(
            `UPDATE users 
             SET email_verified = true, 
                 verification_token = NULL, 
                 verification_token_expires = NULL,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [userId],
        );

        await client.query("COMMIT");

        sendSuccess(res, 200, SuccessMessages.EMAIL_VERIFIED);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Email verification error:", error);
        sendError(res, 500, ErrorMessages.VERIFICATION_FAILED);
    } finally {
        client.release();
    }
});

router.get("/code", authenticateToken, async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const userId = (req as any).user.userId;

        await client.query("BEGIN");

        const userResult = await client.query(
            "SELECT id, email, email_verified, verification_token, verification_token_expires FROM users WHERE id = $1",
            [userId],
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return sendError(res, 404, ErrorMessages.USER_NOT_FOUND);
        }

        const user = userResult.rows[0];

        if (user.email_verified) {
            await client.query("ROLLBACK");
            return sendError(res, 400, ErrorMessages.EMAIL_ALREADY_VERIFIED);
        }

        const verificationCode = await sendVerificationEmail(user.email);
        const tokenExpires = new Date(Date.now() + 5 * 60 * 1000);

        await client.query(
            `UPDATE users 
             SET verification_token = $1, 
                 verification_token_expires = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [verificationCode, tokenExpires, userId],
        );

        await client.query("COMMIT");

        sendSuccess(res, 200, SuccessMessages.VERIFICATION_CODE_SENT, {
            expiresIn: "5 minutes",
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Send verification code error:", error);
        sendError(res, 500, ErrorMessages.VERIFICATION_CODE_SEND_FAILED);
    } finally {
        client.release();
    }
});

export default router;
