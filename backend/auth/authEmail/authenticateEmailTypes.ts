export interface verificationEmailData {
    userEmail: string;
    verificationCode: string;
}

export interface user {
    email: string;
    isEmailVerified: boolean;
}

export interface verificationCodeStore {
    code: string;
    email: string;
    expiresAt: Date;
    attempts: number;
}

export interface verificationResult {
    success: boolean;
    message: string;
}