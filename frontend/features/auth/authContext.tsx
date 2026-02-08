import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

type User = {
    id: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load token on app start
    useEffect(() => {
        const loadAuth = async () => {
            const storedToken = await SecureStore.getItemAsync("token");
            const storedUser = await SecureStore.getItemAsync("user");

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }

            setIsLoading(false);
        };

        loadAuth();
    }, []);

    const signIn = async (token: string, user: User) => {
        await SecureStore.setItemAsync("token", token);
        await SecureStore.setItemAsync("user", JSON.stringify(user));
        setToken(token);
        setUser(user);
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                signIn,
                signOut,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
