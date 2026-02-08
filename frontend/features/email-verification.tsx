import {env} from "../config/env";

type EmailVerificationRequest = {
    email: string;
};
type EmailVerificationCodeRequest = {
    email: string;
    code: string;
};
type EmailVerificationResponse = {};
type EmailVerificationCodeResponse = {};

export async function EmailVerificationApi(
    payload: EmailVerificationRequest
): Promise<EmailVerificationResponse> {
    const response = await fetch(`${env.apiUrl}/email-verification`, { //ToDo: add correct api call (doesnt yet exist)
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

export async function EmailVerificationCodeApi(
    payload: EmailVerificationCodeRequest
): Promise<EmailVerificationCodeResponse> {
    const response = await fetch(`${env.apiUrl}/email-verification-code`, { //ToDo: add correct api call (doesnt yet exist)
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