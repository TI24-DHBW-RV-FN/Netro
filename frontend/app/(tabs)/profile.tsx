import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles, themeColors } from "../../constants/styles";
import { authStyles } from "../(auth)/styles";
import { router } from "expo-router";
import { useAuth } from "../../features/auth/authContext";

export default function ProfileScreen() {
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        router.replace('/'); // navigate back to the home screen after logout
    }

    return (
        <SafeAreaView style={homeStyles.container}>
            {/* Header im gleichen Stil wie auf der Home-Seite */}
            <View style={homeStyles.header}>
                <Text style={homeStyles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={authStyles.button} onPress={handleLogout}>
                    <Text style={authStyles.buttonText}>Log Out</Text>
                </TouchableOpacity>
                <Text style={{ color: themeColors.text }}>Welcome to your profile!</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});