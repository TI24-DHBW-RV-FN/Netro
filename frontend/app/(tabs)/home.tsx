import { View, Text, StyleSheet } from "react-native";

export default function HomeLandingPage() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Willkommen auf deinem Feed!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold' }
});