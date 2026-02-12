import { useState } from "react";
import { loginApi } from "./api";
import { useAuth } from "./authContext";
import dotenv from "dotenv";

dotenv.config();


export function useLogin() {
    const { signIn } = useAuth();

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

            const data = await loginApi({ email, password });

            if (process.env.type == "dev") {
                console.log("Logged in!", data);
            }

            await signIn(data.token, data.user);

            // optionally store token, user, etc.
            // localStorage.setItem("token", data.token);

            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
            return false;
        } finally {
            setLoading(false);
        }
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

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
