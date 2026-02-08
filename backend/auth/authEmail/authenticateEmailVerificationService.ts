import { verificationCodeStore, verificationResult } from "./authenticateEmailTypes.js";
import { generateVerificationCode } from "./authenticateEmailCodeGenerator.js";
import { canResendCode } from "./authenticateEmailRateLimiter.js";
import { sendVerificationEmail } from "./authenticateEmailService.js";
import { markEmailAsVerified } from "./authenticateEmailUserRepository.js";

const verificationCodes = new Map<string, verificationCodeStore>();
const CODE_EXPIRY_MINUTES = 5;
const MAX_VERIFICATION_ATTEMPTS = 3;

export const storeVerificationCode = (email: string, code: string): void => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);

    verificationCodes.set(email, {
        code,
        email,
        expiresAt,
        attempts: 0
    });
};

export const sendVerificationAfterRegistration = async (
    userEmail: string
): Promise<void> => {
    const code = generateVerificationCode();
    storeVerificationCode(userEmail, code);

    await sendVerificationEmail({
        userEmail,
        verificationCode: code
    });

    console.log("Verification email sent");
};

export const verifyCode = async (
    email: string,
    code: string
): Promise<verificationResult> => {
    const stored = verificationCodes.get(email);

    if (!stored) {
        return {
            success: false,
            message: "No verification code found for this email"
        };
    }

    if (new Date() > stored.expiresAt) {
        verificationCodes.delete(email);
        return {
            success: false,
            message: "Verification code has expired"
        };
    }

    if (stored.attempts >= MAX_VERIFICATION_ATTEMPTS) {
        verificationCodes.delete(email);
        return {
            success: false,
            message: "Too many failed attempts. Please request a new code"
        };
    }

    if (stored.code !== code) {
        stored.attempts++;
        return {
            success: false,
            message: "Invalid verification code"
        };
    }

    const dbUpdateSuccess = await markEmailAsVerified(email);

    if (!dbUpdateSuccess) {
        return {
            success: false,
            message: "Verification succeeded but database update failed"
        };
    }

    verificationCodes.delete(email);
    return {
        success: true,
        message: "Email verified successfully"
    };
};

export const resendVerificationCode = async (email: string): Promise<void> => {
    if (!canResendCode(email)) {
        throw new Error("Too many resend attempts. Please try again later.");
    }

    const code = generateVerificationCode();
    storeVerificationCode(email, code);

    await sendVerificationEmail({
        userEmail: email,
        verificationCode: code
    });
};

export const cleanupExpiredCodes = (): void => {
    const now = new Date();
    for (const [email, data] of verificationCodes.entries()) {
        if (now > data.expiresAt) {
            verificationCodes.delete(email);
        }
    }
};
