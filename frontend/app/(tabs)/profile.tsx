import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles, themeColors } from "../../constants/styles";

export default function ProfileScreen() {
    return (
        <SafeAreaView style={homeStyles.container}>
            {/* Header im gleichen Stil wie auf der Home-Seite */}
            <View style={homeStyles.header}>
                <Text style={homeStyles.headerTitle}>Profile</Text>
            </View>

            <View style={styles.content}>
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