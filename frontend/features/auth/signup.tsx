import { useState } from "react";
import { signupApi } from "./api";
import { useSignup } from "../../app/(auth)/_layout";
import { useAuth } from "./authContext";
import {router} from "expo-router";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useSubmitSignup() {
    const { email, password, username, location, bio, categories} = useSignup();
    const { signIn } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitSignup = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!isValidEmail(email)) {
                throw new Error("Please enter a valid email address");
            }
            if (password.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }

            const data = await signupApi({
                    email: email,
                    password: password,
                    userName: username,
                    currentLocation: location,
                    bio: bio,
                    categories: categories,
                });

            await signIn(data.token, data.user);
            router.replace("/");
            return true
        } catch ( err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
            return false;
        } finally {
            setLoading(false);
        }
    }

        return {
            loading,
            error,
            submitSignup,
        };

}
