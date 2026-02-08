import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles, themeColors } from "../../constants/styles";

export default function HomeLandingPage() {
    return (
        <SafeAreaView style={homeStyles.container}>
            <View style={homeStyles.header}>
                <Text style={homeStyles.headerTitle}>Netro Feed</Text>
            </View>

            <ScrollView contentContainerStyle={homeStyles.feedContainer}>

            </ScrollView>
        </SafeAreaView>
    );
}