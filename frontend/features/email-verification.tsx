import dotenv from "dotenv";

dotenv.config();

type EmailVerificationRequest = {
    email: string;
};
type EmailVerificationCodeRequest = {
    verificationToken: string;
};
type EmailVerificationResponse = {};
type EmailVerificationCodeResponse = {};

export async function emailVerificationApi(
    payload: EmailVerificationRequest
): Promise<EmailVerificationResponse> {
    const response = await fetch(`${process.env.API_URL}/verify/code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Something went wrong. Please try again");
    }

    return response.json();
}

export async function emailVerificationCodeApi(
    payload: EmailVerificationCodeRequest
): Promise<EmailVerificationCodeResponse> {
    const response = await fetch(`${process.env.API_URL}/verify/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Verification failed");
    }

    return response.json();
}