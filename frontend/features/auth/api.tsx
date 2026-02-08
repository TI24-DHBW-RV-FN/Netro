import { env } from "../../config/env";

type LoginRequest = {
    email: string;
    password: string;
};

type LoginResponse = {
    token: string;
    user: {
        id: string;
        email: string;
    };
};

export async function loginApi(
    payload: LoginRequest
): Promise<LoginResponse> {
    const response = await fetch(`${env.apiUrl}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Login failed");
    }

    return response.json();
}
