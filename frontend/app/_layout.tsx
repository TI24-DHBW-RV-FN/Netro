import { Stack } from "expo-router";
import { AuthProvider } from "../features/auth/authContext";
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';


export default function RootLayout() {
    const [appReady, setAppReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // TODO: Load await (example loadResourcesAsync()
                await new Promise(resolve => setTimeout(resolve, 20));
            } catch (e) {
                console.warn("Error while Loading:", e);
            } finally {
                setAppReady(true);
            }
        }

        prepare();
    }, []);

    if (!appReady) {
        return (
            <View style={styles.splashContainer}>
                <Text style={styles.logo}>Netro</Text>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});