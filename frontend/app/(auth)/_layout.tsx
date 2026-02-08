import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../features/auth/authContext";

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}