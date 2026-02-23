import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NetroEvent } from '../../../types/event';

export function EventCard({ event }: { event: NetroEvent }) {
    // Requirement: Implementierung einer verkürzten Eventkarte mit Vorschaubild
    const imageSource = event.imageUrl
        ? { uri: event.imageUrl }
        : require('../../../assets/netro-icon.png'); // Fallback icon

    return (
        <TouchableOpacity style={styles.card}>
            <Image source={imageSource} style={styles.thumbnail} />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.info}>
                    {new Date(event.startTime).toLocaleDateString('de-DE')} - {event.location}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#1e1e1e', borderRadius: 12, marginVertical: 8, overflow: 'hidden' },
    thumbnail: { width: '100%', height: 150, resizeMode: 'cover' },
    content: { padding: 12 },
    title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    info: { color: '#AAA', fontSize: 14, marginTop: 4 },
});