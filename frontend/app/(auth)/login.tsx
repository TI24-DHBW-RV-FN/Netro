import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { authStyles } from "./styles";
import { router } from "expo-router";
import { useLogin } from "../../features/auth/login";

export default function LoginScreen() {
    // Keep the hook for state management of the UI inputs
    const { email, setEmail, password, setPassword, error } = useLogin();

    // English comment according to Guideline 4
    // Bypass authentication for UI development purposes
    const handleBypassLogin = () => {
        // Navigate directly to the landing page
        router.replace("/(tabs)/home");
    };

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.buttonText}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Login</Text>
            <Text style={authStyles.subtitle}>Welcome back!</Text>

            {/* Error display still functional for UI testing */}
            {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}

            <TextInput
                style={authStyles.input}
                placeholder="E-Mail"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={authStyles.input}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
            />

            {/* Updated button to use the bypass function */}
            <TouchableOpacity style={authStyles.button} onPress={handleBypassLogin}>
                <Text style={authStyles.buttonText}>Log In (Bypass)</Text>
            </TouchableOpacity>
        </View>
    );
}