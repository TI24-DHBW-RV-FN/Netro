import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../token/authenticateToken.js";
import { sendVerificationEmail } from "../email/sendVerificationEmail.js";

const router = Router();

router.post("/email", authenticateToken, async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const { verificationToken } = req.body;
        const userId = (req as any).user.userId;

        // Validate input
        if (!verificationToken) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required",
            });
        }

        await client.query("BEGIN");

        // Get user with verification details
        const userResult = await client.query(
            "SELECT id, email, email_verified, verification_token, verification_token_expires FROM users WHERE id = $1",
            [userId],
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = userResult.rows[0];

        // Check if already verified
        if (user.email_verified) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        // Check if verification token exists
        if (!user.verification_token) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "No verification token found. Please request a new one.",
            });
        }

        // Check if token matches
        if (user.verification_token !== verificationToken) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Invalid verification token",
            });
        }

        // Check if token has expired
        const now = new Date();
        const expiresAt = new Date(user.verification_token_expires);

        if (now > expiresAt) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Verification token has expired. Please request a new one.",
            });
        }

        // Update user: set email_verified to true and clear verification fields
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

        res.json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Email verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify email",
        });
    } finally {
        client.release();
    }
});

router.get("/code", authenticateToken, async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const userId = (req as any).user.userId;

        await client.query("BEGIN");

        // Get user details
        const userResult = await client.query(
            "SELECT id, email, email_verified, verification_token, verification_token_expires FROM users WHERE id = $1",
            [userId],
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = userResult.rows[0];

        // Check if already verified
        if (user.email_verified) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        // Generate new 6-digit verification code
        const verificationCode = await sendVerificationEmail(user.email);
        const tokenExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Update user with new verification code and expiration
        await client.query(
            `UPDATE users 
             SET verification_token = $1, 
                 verification_token_expires = $2,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [verificationCode, tokenExpires, userId],
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Verification code sent successfully. Please check your email.",
            expiresIn: "5 minutes",
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Send verification code error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send verification code",
        });
    } finally {
        client.release();
    }
});
export default router;
