import React from 'react';
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../../constants/styles";
import { EventCard } from "../../features/event/components/EventCard";
import { NetroEvent } from "../../types/event"; // Ensure this is exported

// Variable names in lowerCamelCase
// Variable names in lowerCamelCase according to Guideline 3
// Variable names in lowerCamelCase according to guideline 3
const mockEvents: NetroEvent[] = [
    {
        id: 1,
        title: "Basketball match",
        description: "Streetball tournament in the city center.",
        startTime: "2026-03-15T18:00:00Z",
        location: "Central Park",
        seriesEvent: false,
        frequency: null,
        createdAt: "2024-02-13T10:30:00.000Z", // Required by interface
        updatedAt: "2024-02-13T10:30:00.000Z", // Required by interface
        createdByUserId: 1,
        categories: ["Sports"]
    },
];

export default function HomeLandingPage() {
    return (
        <SafeAreaView style={homeStyles.container}>
            <View style={homeStyles.header}>
                <Text style={homeStyles.headerTitle}>Netro Feed</Text>
            </View>

            <ScrollView contentContainerStyle={homeStyles.feedContainer}>
                {/* Comments in English */}
                {mockEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}