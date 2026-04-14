import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '../../features/event/components/EventCard';
import { NetroEvent } from '../../types/event';

// Example events
const myEvents: NetroEvent[] = [
    {
        id: 1,
        title: "Basketball Game",
        description: "Friendly basketball match at the park",
        startTime: "2026-03-15T18:00:00.000Z", //
        location: "Central Park",
        seriesEvent: true, //
        frequency: "weekly", //
        createdAt: "2024-02-13T10:30:00.000Z", //
        updatedAt: "2024-02-13T10:30:00.000Z", //
        createdByUserId: 1,
        categories: ["basketball", "gaming"], //
        imageUrl: "https://via.placeholder.com/150"
    },
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