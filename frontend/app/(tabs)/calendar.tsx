import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '../../features/event/components/EventCard';
import { NetroEvent } from '../../types/event';

// Example events
const myEvents: NetroEvent[] = [
    {
        id: 1,
        title: "Basketball match",
        description: "Your match",
        startTime: "2026-03-20T18:00:00Z",
        location: "City Court",
        seriesEvent: false,
        frequency: null,
        createdByUserId: 1, // Let's assume this is your ID
        categories: ["Sports"],
        createdAt: "2024-02-13T10:30:00.000Z",
        updatedAt: "2024-02-13T10:30:00.000Z"
    }
];

export default function CalendarPage() {
    // DoD: "own events shown after date"
    const sortedEvents = useMemo(() => {
        return [...myEvents].sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Calendar</Text>
            </View>
            <ScrollView contentContainerStyle={styles.listContainer}>
                {sortedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050510' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#1B1B3A' },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    listContainer: { padding: 15 }
});