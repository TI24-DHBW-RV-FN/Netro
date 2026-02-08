import { View, Text, TouchableOpacity, TextInput} from "react-native";
import { authStyles } from "./styles";
import {router} from "expo-router";
import { useSignup } from "./_layout";



export default function LoginScreen() {
    const { password, updatePassword } = useSignup();

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.text}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Sign Up</Text>
            <Text style={authStyles.subtitle}></Text>

            <Text style={authStyles.subtitle}>Please choose a password (8 characters minimum):</Text>

            <TextInput
                style={authStyles.input}
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={updatePassword}
            />

            <TouchableOpacity style={authStyles.button} onPress={() => router.push("/(auth)/signup-location")}>
                <Text style={authStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}
