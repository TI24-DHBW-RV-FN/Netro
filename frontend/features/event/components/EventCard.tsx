import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router'; // Necessary for navigation
import { NetroEvent } from '../../../types/event';

export function EventCard({ event }: { event: NetroEvent }) {
    const router = useRouter();

    // Requirement: Navigation triggers "ladeEventDaten"
    const handlePress = () => {
        router.push(`/kalender/${event.id}`);
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <Image
                source={event.imageUrl ? { uri: event.imageUrl } : require('../../../assets/netro-icon.png')}
                style={styles.thumbnail}
            />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.info}>
                    {new Date(event.startTime).toLocaleDateString('de-DE')} - {event.location}
                </Text>
                {/* Requirement: "Mehr Details anzeigen" interaction */}
                <Text style={styles.moreDetails}>Show more details ›</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#1e1e1e', borderRadius: 12, marginVertical: 8, overflow: 'hidden' },
    thumbnail: { width: '100%', height: 150 },
    content: { padding: 12 },
    title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    info: { color: '#AAA', fontSize: 14, marginTop: 4 },
    moreDetails: { color: '#8A2BE2', marginTop: 8, fontWeight: '600' } // Corporate color
});