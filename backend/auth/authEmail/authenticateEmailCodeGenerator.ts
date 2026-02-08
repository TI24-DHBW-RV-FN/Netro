import crypto from "crypto";

// Generation 6 Code
export const generateVerificationCode = (): string => {
    return crypto.randomInt(0, 999999).toString().padStart(6, '0');
};