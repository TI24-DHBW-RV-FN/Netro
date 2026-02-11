import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles, themeColors } from "../../constants/styles";
import { authStyles } from "../(auth)/styles";
import { router } from "expo-router";
import { useAuth } from "../../features/auth/authContext";

export default function ProfileScreen() {
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            // Task: "Removal of Login Tokens"
            await signOut();
            // Task: "Redirect to Login/Register"
            router.replace('/login');
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    }

    return (
        <SafeAreaView style={homeStyles.container}>
            {}
            <View style={homeStyles.header}>
                <Text style={homeStyles.headerTitle}>Profile</Text>
            </View>

            {/* Using homeStyles.content because it is already defined in your styles.ts */}
            <View style={homeStyles.content}>
                <TouchableOpacity style={authStyles.button} onPress={handleLogout}>
                    {/* Task: Button must say "Ausloggen" */}
                    <Text style={authStyles.buttonText}>Ausloggen</Text>
                </TouchableOpacity>

                <Text style={{ color: themeColors.text, marginTop: 20 }}>
                    Welcome to your profile!
                </Text>
            </View>
        </SafeAreaView>
    );
}