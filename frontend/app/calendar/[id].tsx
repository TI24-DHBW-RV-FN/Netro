import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NetroEvent } from '../../types/event';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();
    const [event, setEvent] = useState<NetroEvent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock ID for Development
    const currentUserId = 1;

    useEffect(() => {
        // Requirement: Navigation triggers "loadEventData"
        const loadEventData = async () => {
            try {
                setIsLoading(true);
                console.log(`Triggering loadEventData(POST for eventId: ${id})`);

                setTimeout(() => {
                    const mockFetchedEvent: NetroEvent = {
                        id: Number(id),
                        title: "Basketball Game", // Aligned with API example
                        description: "Friendly basketball match at the park", // Aligned with API example
                        startTime: "2026-03-15T18:00:00.000Z", // ISO 8601 format
                        location: "Central Park", //
                        seriesEvent: true, // Example from new spec
                        frequency: "weekly", // Must be string or null
                        createdAt: "2024-02-13T10:30:00.000Z", //
                        updatedAt: "2024-02-13T10:30:00.000Z", //
                        createdByUserId: 1, //
                        categories: ["basketball", "gaming"] // Array of strings
                    };
                    setEvent(mockFetchedEvent);
                    setIsLoading(false);
                }, 500);
            } catch (error) {
                console.error("Error loading event:", error);
                setIsLoading(false);
            }
        };

        loadEventData();
    }, [id]);

    if (isLoading) return <ActivityIndicator style={styles.container} color="#8A2BE2" />;

    //Detail view only for Card-Owner
    if (event && event.createdByUserId !== currentUserId) {
        return (
            <View style={styles.container}>
                <Text style={{ color: 'red', fontWeight: 'bold' }}>Access Denied</Text>
                <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 10 }}>
                    Only the event owner can view full details.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{event?.title}</Text>
            <Text style={styles.idText}>Event ID: {id}</Text>

            <View style={styles.detailsBox}>
                <Text style={styles.description}>{event?.description}</Text>
                <Text style={styles.meta}>Location: {event?.location}</Text>
                {/* Formatting Date */}
                <Text style={styles.meta}>Start: {new Date(event?.startTime || "").toLocaleString()}</Text>
                {/* Showing frequency if it's a series event */}
                {event?.seriesEvent && (
                    <Text style={styles.meta}>Frequency: {event.frequency}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050510', padding: 20, justifyContent: 'center', alignItems: 'center' },
    title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    idText: { color: '#8A2BE2', marginBottom: 20 },
    detailsBox: { padding: 15, backgroundColor: '#1A1A1A', borderRadius: 10, width: '100%' },
    description: { color: '#FFF', fontSize: 16, marginBottom: 10 },
    meta: { color: '#AAA', fontSize: 14, marginTop: 5 },
});