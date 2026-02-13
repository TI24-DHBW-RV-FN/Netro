import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { styles } from './styles_tmp';
import { UserData, Category, Event } from '../../features/profile';

interface EditViewProps {
    userData: UserData;
    availableCategories: Category[];
    events: Event[];
    error: string | null;
    isSaving: boolean;
    showDeleteConfirmation: boolean;
    deletePassword: string;
    onUpdateUserData: (field: keyof UserData, value: string | boolean | string[]) => void;
    onToggleCategory: (categoryName: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onCancelEvent: (eventId: string) => void;
    onDeleteAccount: () => void;
    onConfirmDelete: () => void;
    setDeletePassword: (password: string) => void;
}

/**
 * Edit view component for editing user profile data
 */
export const EditView: React.FC<EditViewProps> = ({
                                                      userData,
                                                      availableCategories,
                                                      events,
                                                      error,
                                                      isSaving,
                                                      showDeleteConfirmation,
                                                      deletePassword,
                                                      onUpdateUserData,
                                                      onToggleCategory,
                                                      onSave,
                                                      onCancel,
                                                      onCancelEvent,
                                                      onDeleteAccount,
                                                      onConfirmDelete,
                                                      setDeletePassword,
                                                  }) => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Account Settings</Text>

            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImageText}>
                            {userData.userName.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.changePhotoText}>Tap to change photo</Text>
                </View>

                <View style={styles.profileInfo}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={userData.userName}
                            onChangeText={(text) => onUpdateUserData('userName', text)}
                            editable={!isSaving}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your location"
                            value={userData.currentLocation}
                            onChangeText={(text) => onUpdateUserData('currentLocation', text)}
                            editable={!isSaving}
                        />
                    </View>
                </View>
            </View>

            {/* Stats Row (Read-only in edit mode) */}
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
                <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="Tell us about yourself"
                    value={userData.bio}
                    onChangeText={(text) => onUpdateUserData('bio', text)}
                    multiline
                    numberOfLines={4}
                    editable={!isSaving}
                />
            </View>

            {/* Categories Section */}
            <View style={styles.categoriesSection}>
                <Text style={styles.label}>Categories</Text>
                <View style={styles.categoryGrid}>
                    {availableCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                userData.categories.includes(category.name) && styles.categoryButtonSelected,
                            ]}
                            onPress={() => onToggleCategory(category.name)}
                            disabled={isSaving}
                        >
                            <Text
                                style={[
                                    styles.categoryButtonText,
                                    userData.categories.includes(category.name) && styles.categoryButtonTextSelected,
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Ghost Mode Section */}
            <View style={styles.ghostModeSection}>
                <View style={styles.ghostModeRow}>
                    <View>
                        <Text style={styles.label}>Ghost Mode</Text>
                        <Text style={styles.ghostModeDescription}>
                            Hide your online status from other users
                        </Text>
                    </View>
                    <Switch
                        value={userData.ghostMode}
                        onValueChange={(value) => onUpdateUserData('ghostMode', value)}
                        disabled={isSaving}
                    />
                </View>
            </View>

            {/* Save/Cancel Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton, isSaving && styles.disabledButton]}
                    onPress={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.actionButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={onCancel}
                    disabled={isSaving}
                >
                    <Text style={styles.actionButtonText}>Cancel</Text>
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

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
                <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDeleteAccount}
                    disabled={isSaving}
                >
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>

                {showDeleteConfirmation && (
                    <View style={styles.deleteConfirmation}>
                        <Text style={styles.deleteWarning}>
                            This action cannot be undone. Please enter your password to confirm.
                        </Text>
                        <TextInput
                            style={[styles.input, styles.deleteInput]}
                            placeholder="Enter your password"
                            value={deletePassword}
                            onChangeText={setDeletePassword}
                            secureTextEntry
                        />
                        <View style={styles.deleteActions}>
                            <TouchableOpacity
                                style={styles.confirmDeleteButton}
                                onPress={onConfirmDelete}
                            >
                                <Text style={styles.deleteButtonText}>Confirm Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelDeleteButton}
                                onPress={() => setDeletePassword('')}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};