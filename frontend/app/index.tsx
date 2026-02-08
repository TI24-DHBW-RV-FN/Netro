import {View, Text, TouchableOpacity, Image} from "react-native";
import { router } from "expo-router";
import { authStyles } from "./(auth)/styles";

export default function HomeScreen() {
    return (
        <View style={authStyles.container}>
            <Text style={authStyles.title}>Welcome back to Netro</Text>

            <Image
                source={require('../assets/netro-icon.png')}
                style={{ width: 100, height: 100 }}
            />

            <TouchableOpacity style={authStyles.button} onPress={() => router.push('/(auth)/login')}>
                <Text style={authStyles.buttonText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={authStyles.button} onPress={() => router.push('/(auth)/signup')}>
                <Text style={authStyles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

        </View>
    );
}