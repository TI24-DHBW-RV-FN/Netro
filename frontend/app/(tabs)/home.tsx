import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../../constants/styles";
import { EventCard } from "../../features/events/components/EventCard";
// Example data - this would normally come from your 'ladeEventDaten' call
const mockEvents = [
    { id: 1, title: "Basketball", startTime: "2026-03-15T18:00:00Z", location: "Park" },
];

export default function HomeLandingPage() {
    return (
        <SafeAreaView style={homeStyles.container}>
            <View style={homeStyles.header}>
                <Text style={homeStyles.headerTitle}>Netro Feed</Text>
            </View>

            <ScrollView contentContainerStyle={homeStyles.feedContainer}>
                {/* Rendering the Event Cards */}
                {mockEvents.map(event => (
                    <EventCard key={event.id} event={event as any} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}