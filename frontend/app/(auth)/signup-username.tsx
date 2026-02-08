import { View, Text, TouchableOpacity, TextInput} from "react-native";
import { authStyles } from "./styles";
import {router} from "expo-router";
import { useSignup } from "./_layout";



export default function SignupUsernameScreen() {
    const { username, updateUsername } = useSignup();

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.text}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Sign Up</Text>
            <Text style={authStyles.subtitle}></Text>
            <Text style={authStyles.subtitle}>Please choose a username:</Text>

            <TextInput
                style={authStyles.input}
                placeholder="Username"
                value={username}
                onChangeText={updateUsername}
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TouchableOpacity style={authStyles.button} onPress={() => router.push("/(auth)/signup-password")}>
                <Text style={authStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}
