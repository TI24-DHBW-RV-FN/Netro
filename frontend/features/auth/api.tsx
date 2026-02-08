import {env} from "../../config/env";

type LoginRequest = {
    email: string;
    password: string;
};

type SignupRequest = {
    email: string;
    password: string;
    userName: string;
    currentLocation: string;
    bio: string;
    categories:string[];
};

type LoginResponse = {
    token: string;
    user: {
        id: string;
        email: string;
    };
};

type SignupResponse = {
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

export async function signupApi(
    payload: SignupRequest
): Promise<SignupResponse> {
    const response = await fetch(`${env.apiUrl}/register`, {
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

export type GetCategoriesResponse = {
    categories: { name: string }[];
};

export async function getCategoriesApi(): Promise<GetCategoriesResponse> {
    const response = await fetch(`${env.apiUrl}/category`, {
        method: "GET",
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to load categories");
    }

    return response.json();
}