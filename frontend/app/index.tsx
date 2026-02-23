import React from "react";
import {View, Text, TouchableOpacity, Image} from "react-native";
import {Redirect, router} from "expo-router";
import { authStyles } from "./(auth)/styles";
import { useAuth } from "../features/auth/authContext";

export default function HomeScreen() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return null;

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    return (
        <View style={authStyles.container}>
            <Text style={authStyles.title}>Welcome to Netro</Text>

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