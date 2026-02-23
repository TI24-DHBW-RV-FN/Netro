import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NetroEvent } from '../../../types/event';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams(); // Extract event ID from URL
    const [event, setEvent] = useState<NetroEvent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Requirement: Die Navigation löst Backend-Aufrufe (ladeEventDaten) aus
    useEffect(() => {
        const ladeEventDaten = async () => {
            try {
                setIsLoading(true);
                // Simulate backend call for UI development
                console.log(`Triggering ladeEventDaten for ID: ${id}`);

                // This is where you will later fetch from Simon's Express API
                // For now, we simulate a delay and use local logic
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error("Error loading event details:", error);
            }
        };

        ladeEventDaten();
    }, [id]);

    if (isLoading) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#000' }} />;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 20 }}>
            {/* Full detail view for card owner */}
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Event Details</Text>
            <Text style={{ color: '#ccc', marginTop: 10 }}>Event ID: {id}</Text>
            <Text style={{ color: '#aaa', marginTop: 20 }}>
                Full description and owner-specific data will appear here.
            </Text>
        </ScrollView>
    );
}