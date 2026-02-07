import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

interface verificationEmailData {
    userEmail: string;
    verificationCode: string;
}

interface user {
    email: string;
    isEmailVerified: boolean;
}

interface verficationCodeStore {
    code: string;
    email: string;
    expiresAt: Date;
    attempts: number;
}

const verificationCodes = new Map<string, verficationCodeStore>();

const transporter: Transporter = nodemailer.createTransport ({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.OFFICE365_EMAIL,
        pass: process.env.OFFICE365_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

//test
export const verifyEmailConnection = async(): Promise<boolean> => {
    try {
        await transporter.verify();
        console.log ("Success: SMTP Server is ready")
        return true;
    } catch (error) {
        console.error ("Error: SMTP Connection Error:", error);
        return false;
    }
};

// Generation 6 Code
export const generateVerificationCode = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

// Save Code
export const storeVerficationCode = (email: string, code: string): void => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    verificationCodes.set(email, {
        code,
        email,
        expiresAt,
        attempts: 0
    });
};

//eMail
export const sendVerificationEmail = async (data: verificationEmailData): Promise<void> => {
    const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.OFFICE365_EMAIL}>`,
        to: `netrotest.evergreen161@passmail.net`,
        subject: "Welcome to Netro, Verify your email address",
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to ${process.env.APP_NAME}!</h2>
                    <p>Pleasy verify</p>
                    <div class="codeBox">${data.verificationCode}</div>
            </body>
            </html>
        `
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Success: Email Verifaction sent:", info.messageId);
    } catch (error) {
        console.error("Error: Sending Verifaction:", error);
        throw new Error("Failed to send verifaction email");
    }
};

// Verification after Registration
export const sendVerificationAfterRegistration = async(userMail: string): Promise<void> => {
    const code = generateVerificationCode();
    storeVerficationCode(userMail, code);

    await sendVerificationEmail({
        userEmail: userMail,
        verificationCode: code
    });
    console.log("Verified-Email send")
};

// Login Check
export const checkEmailVerified = async (email: string): Promise<boolean> => {
    try {
        // --- Abfrage DB ----
        console.log("Success: Checking Verfified-Status");
        return true;
    } catch (error) {
        console.error("Error: Verfifing-Status:", error);
        return false;
    }
}

// Code check
export const verifyCode = async(email: string, code: string): Promise<{ success: boolean, message: string }> => {
    const stored = verificationCodes.get(email);

    if (!stored) {
        return { success: false, message:"No verfication code found for this email"};
    }

    if (new Date() > stored.expiresAt) {
        verificationCodes.delete(email);
        return { success: false, message:"Verfication code has expired"};
    }

    if (stored.attempts >= 3) {
        verificationCodes.delete(email);
        return { success: false, message: "Too many failed attempts. Please request a new code"};
    }

    if (stored.code !== code) {
        stored.attempts++;
        return { success: false, message: "Invalid verification code" };
    }

    const dbUpdateSuccess = await markEmailAsVerified(email);

    if (!dbUpdateSuccess) {
        return { success: false, message: "Verification succeeded but db update failed"};
    }

    verificationCodes.delete(email);
    return { success: true, message: "Email verified successfully" };
};

// Resend Code
export const resendVerificationCode = async (email: string): Promise<void> => {
    const code = generateVerificationCode();
    storeVerficationCode(email, code);
    await sendVerificationEmail({userEmail: email, verificationCode: code});
};

//Cleanup
export const cleanupExpiredCodes = (): void => {
    const now = new Date();
    for (const [email, data] of verificationCodes.entries()) {
        if (now > data.expiresAt) {
            verificationCodes.delete(email);
        }
    }
};

// Rate Limiting
const resendAttempts = new Map<string, number>();

export const canResendCode = (email: string): boolean => {
    const attempts = resendAttempts.get(email) || 0;
    if (attempts >= 3) {
        return false;
    }
    resendAttempts.set(email, attempts + 1);
    setTimeout(() => resendAttempts.delete(email), 3600000);
    return true;
}

// Mark as Verified
export const markEmailAsVerified = async (email: string): Promise<boolean> => {
    try {
        console.log("Success: Email is saved as verified");
        return true;
    } catch (error) {
        console.error("Error: Error while saving:", error);
        return false;
    }
};