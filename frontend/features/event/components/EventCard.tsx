import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { NetroEvent } from '../../../types/event';
import { eventStyles } from '../../../constants/styles';

// Component name in UpperCamelCase
export function EventCard({ event }: { event: NetroEvent }) {
    const router = useRouter();

    // Navigation triggers the backend call (via detail page load)
    const handlePress = () => {
        router.push(`/kalender/${event.id}`);
    };

    return (
        <TouchableOpacity style={eventStyles.card} onPress={handlePress}>
            {/* Placeholder for preview image as per requirement */}
            <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
                style={eventStyles.thumbnail}
            />
            <View style={eventStyles.content}>
                <Text style={eventStyles.title} numberOfLines={1}>{event.title}</Text>
                {/* Date formatted according to German locale */}
                <Text style={eventStyles.info}>
                    {new Date(event.startTime).toLocaleDateString('de-DE')}
                </Text>
                <Text style={eventStyles.info} numberOfLines={1}>{event.location}</Text>
            </View>
        </TouchableOpacity>
    );
}