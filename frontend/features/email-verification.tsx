import {env} from "../config/env";

type EmailVerificationRequest = {
    authenticationToken: string;
};
type EmailVerificationCodeRequest = {
    authenticationToken: string;
    verificationToken: string;
};
type EmailVerificationResponse = {};
type EmailVerificationCodeResponse = {};

export async function emailVerificationApi(
    payload: EmailVerificationRequest
): Promise<EmailVerificationResponse> {
    const response = await fetch(`${env.apiUrl}/verify/code`, {
        method: "GET",
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
    const response = await fetch(`${env.apiUrl}/verify/email`, {
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