import { Stack,Redirect } from "expo-router";
import { useAuth } from "../../features/auth/authContext";
import { createContext, useContext, useState } from 'react';

type SignupContextType = {
    email: string;
    password: string;
    username: string;
    location: string;
    bio: string;
    categories: string[];
    updateEmail: (email: string) => void;
    updatePassword: (password: string) => void;
    updateUsername: (username: string) => void;
    updateLocation: (location: string) => void;
    updateBio: (bio: string) => void;
    updateCategories: (categories: string[]) => void;
};

const SignupContext = createContext<SignupContextType | null>(null);


export function useSignup() {
    const ctx = useContext(SignupContext);
    if (!ctx) {
        throw new Error("useSignup must be used within SignupContext.Provider");
    }
    return ctx;
}


export default function AuthLayout() {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [categories, setCategories] = useState<string[]>([]);

    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    //if (isAuthenticated) {
    //    return <Redirect href="/(tabs)/home" />;
    //}

    return (
        <SignupContext.Provider
        value={{
            email,
            password,
            username,
            location,
            bio,
            categories,
            updateEmail: setEmail,
            updatePassword: setPassword,
            updateUsername: setUsername,
            updateLocation: setLocation,
            updateBio: setBio,
            updateCategories: setCategories,
        }}>
            <Stack screenOptions={{ headerShown: false }} />
        </SignupContext.Provider>
    );
}