// feature/auth/login.ts
import { useState } from "react";

export function useLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!email || !password) {
                throw new Error("Please fill in both fields");
            }
            if (!isValidEmail(email)) {
                throw new Error("Please enter a valid email address");
            }

            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "email":email,
                    "password":password,
                }),
            });

            if (!response.ok) {
                // try to read backend error message
                const data = await response.json().catch(() => null);
                throw new Error(data?.message || "Login failed");
            }

            const data = await response.json();
            console.log("Logged in!", data);

            // optionally store token, user, etc.
            // localStorage.setItem("token", data.token);

            return true;
        } catch (err: any) {
            setError(err.message || "Something went wrong");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        login,
    };
}
