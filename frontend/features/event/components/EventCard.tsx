import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { NetroEvent } from '../../../types/event';

export function EventCard({ event }: { event: NetroEvent }) {
    const router = useRouter();

    const handlePress = () => {
        router.push(`/kalender/${event.id}`);
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={styles.thumbnail}
            />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.info}>
                    {new Date(event.startTime).toLocaleDateString('de-DE')}
                </Text>
                <Text style={styles.info} numberOfLines={1}>{event.location}</Text>
            </View>
        </TouchableOpacity>
    );
}

// Local styles to avoid "undefined" errors from external files
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        elevation: 3, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    thumbnail: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    content: {
        paddingHorizontal: 5,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    info: {
        color: '#AAAAAA',
        fontSize: 14,
        marginTop: 4,
    },
});