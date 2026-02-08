import { View, Text, TouchableOpacity, TextInput} from "react-native";
import { authStyles } from "./styles";
import {router} from "expo-router";
import { useSignup } from "./_layout";


export default function SignupScreen() {
    const { email, updateEmail } = useSignup();

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.buttonText}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Sign Up</Text>
            <Text style={authStyles.subtitle}>Welcome!</Text>
            <Text style={authStyles.subtitle}>Please enter your e-mail address:</Text>

            <TextInput
                style={authStyles.input}
                placeholder="E-Mail"
                keyboardType="email-address"
                value={email}
                onChangeText={updateEmail}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TouchableOpacity style={authStyles.button} onPress={() => router.push("/(auth)/signup-username")}>
                <Text style={authStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}
