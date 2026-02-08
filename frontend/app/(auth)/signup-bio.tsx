import { View, Text, TouchableOpacity, TextInput} from "react-native";
import { authStyles } from "./styles";
import {router} from "expo-router";
import { useSignup } from "./_layout";

export default function LoginScreen() {
    const { bio, updateBio } = useSignup();

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.text}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Sign Up</Text>
            <Text style={authStyles.subtitle}></Text>
            <Text style={authStyles.subtitle}>Please enter your short Bio:</Text>

            <TextInput
                style={authStyles.input}
                placeholder="Bio"
                value={bio}
                onChangeText={updateBio}
            />

            <TouchableOpacity style={authStyles.button} onPress={() => router.push("/(auth)/signup-categories")}>
                <Text style={authStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}
