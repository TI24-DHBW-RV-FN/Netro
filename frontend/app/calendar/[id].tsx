import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();

    useEffect(() => {
        // Requirement: Trigger "ladeEventDaten" on navigation
        console.log("Fetching event data for ID:", id);
    }, [id]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vollständige Event-Informationen</Text>
            <Text style={styles.idText}>Event ID: {id}</Text>
            {/* Logic: Listing only for Card-Owner */}
            <View style={styles.detailsBox}>
                <Text style={styles.placeholder}>Hier erscheinen die detaillierten Informationen vom Backend...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050510', padding: 20, justifyContent: 'center' },
    title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    idText: { color: '#8A2BE2', marginBottom: 20 },
    detailsBox: { padding: 15, backgroundColor: '#1A1A1A', borderRadius: 10 },
    placeholder: { color: '#AAA', fontStyle: 'italic' }
});