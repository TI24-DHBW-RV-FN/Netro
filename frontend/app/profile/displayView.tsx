import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { styles } from './styles_tmp';
import { UserData, Event } from '../../features/profile';

interface DisplayViewProps {
    userData: UserData;
    events: Event[];
    onEdit: () => void;
    onCancelEvent: (eventId: string) => void;
}

/**
 * Display view component showing user profile data
 */
export const DisplayView: React.FC<DisplayViewProps> = ({
                                                            userData,
                                                            events,
                                                            onEdit,
                                                            onCancelEvent,
                                                        }) => {
    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImageText}>
                            {userData.userName.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                </View>
                <View style={styles.profileInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{userData.userName || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Location</Text>
                        <Text style={styles.value}>{userData.currentLocation || 'Not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Ghost Mode</Text>
                        <Text style={styles.value}>{userData.ghostMode ? 'Enabled' : 'Disabled'}</Text>
                    </View>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{userData.followerCount}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{userData.eventCount}</Text>
                    <Text style={styles.statLabel}>Events</Text>
                </View>
            </View>

            {/* Bio Section */}
            <View style={styles.bioSection}>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.bioText}>{userData.bio || 'No bio set'}</Text>
            </View>

            {/* Categories Section */}
            <View style={styles.categoriesSection}>
                <Text style={styles.label}>Categories</Text>
                <View style={styles.categoryList}>
                    {userData.categories.length > 0 ? (
                        userData.categories.map((category, index) => (
                            <View key={index} style={styles.categoryChip}>
                                <Text style={styles.categoryChipText}>{category}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No categories selected</Text>
                    )}
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
            </View>

            {/* Events List */}
            <View style={styles.eventsList}>
                <Text style={styles.sectionTitle}>My Events</Text>
                {events.length > 0 ? (
                    events.map((event) => (
                        <View key={event.id} style={styles.eventItem}>
                            <View style={styles.eventInfo}>
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDetails}>
                                    {event.date} • {event.location}
                                </Text>
                                {event.participantCount && (
                                    <Text style={styles.eventDetails}>
                                        {event.participantCount} participants
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.cancelEventButton}
                                onPress={() => onCancelEvent(event.id)}
                            >
                                <Text style={styles.cancelEventButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyEventsText}>No events found</Text>
                )}
            </View>
        </ScrollView>
    );
};