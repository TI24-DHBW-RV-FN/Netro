import { View, Text, TouchableOpacity } from "react-native";
import { authStyles } from "./styles";
import {router} from "expo-router";
import { useSignup } from "./_layout";
import { useSubmitSignup} from "../../features/auth/signup";

export default function LoginScreen() {
    const { email, username, location, bio} = useSignup();

    const { error, submitSignup} = useSubmitSignup();

    return (
        <View style={authStyles.container}>
            <TouchableOpacity style={authStyles.button} onPress={() => router.back()}>
                <Text style={authStyles.text}>Go Back</Text>
            </TouchableOpacity>

            <Text style={authStyles.title}>Sign Up</Text>
            <Text style={authStyles.subtitle}></Text>
            <Text style={authStyles.subtitle}>Confirm all details:</Text>

            <Text style={authStyles.subtitle}></Text>

            <Text style={authStyles.text}>E-Mail: {email}</Text>
            <Text style={authStyles.text}>Username: {username}</Text>
            <Text style={authStyles.text}>Location: {location}</Text>
            <Text style={authStyles.text}>Bio: {bio}</Text>

            <Text style={authStyles.subtitle}></Text>
            {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}

            <TouchableOpacity style={authStyles.button} onPress={submitSignup}>
                <Text style={authStyles.buttonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
}
