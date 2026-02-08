import { View, Text, TouchableOpacity, TextInput} from "react-native";
import { authStyles } from "./styles";
import {router} from "expo-router"; // import the styles
import { useLogin } from "../../features/auth/login"; // import your hook


export default function LoginScreen() {
    const { email, setEmail, password, setPassword, error, login, loading } = useLogin();

    const handleLogin = async () => {
        const success = await login();
        if (success) {
            // no navigation needed!
        }
    };

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.buttonText}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Login</Text>
            <Text style={authStyles.subtitle}>Welcome back!</Text>

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

            <TouchableOpacity style={authStyles.button} onPress={handleLogin}>
                <Text style={authStyles.buttonText}>Log In</Text>
            </TouchableOpacity>
        </View>
    );
}
