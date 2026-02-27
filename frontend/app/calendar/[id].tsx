import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NetroEvent } from '../../types/event';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();
    const [event, setEvent] = useState<NetroEvent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const currentUserId = 1;

    useEffect(() => {
        // DoD Requirement: Navigation triggers "loadEventData"
        const loadEventData = async () => {
            try {
                setIsLoading(true);
                console.log(`Triggering ladeEventDaten for ID: ${id}`);

                setTimeout(() => {
                    const mockFetchedEvent: NetroEvent = {
                        id: Number(id),
                        title: "Basketball match",
                        description: "Full detailed description only for owners.",
                        startTime: "2026-03-15T18:00:00Z",
                        location: "Central Park",
                        seriesEvent: false,
                        frequency: null,
                        createdByUserId: 1, // Change this to 2 to test the owner protection
                        categories: ["Sports"],
                        createdAt: "2024-02-13T10:30:00.000Z",
                        updatedAt: "2024-02-13T10:30:00.000Z"
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

    // DoD Requirement: Listing only for Card-Owner
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
                <Text style={styles.meta}>Start: {new Date(event?.startTime || "").toLocaleString()}</Text>
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