import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
} from 'react-native';
import { styles } from "./styles";
import {router} from "expo-router";

interface UserData {
    name: string;
    location: string;
    bio: string;
    profileImage: string | null;
    friends: number;
    events: number;
    mode: boolean;
}

interface Event {
    id: string;
    title: string;
}

export default function settingsScreen() {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState<UserData>({
        name: "Name",
        location: "Location",
        bio: "Bio",
        profileImage: null,
        friends: 0,
        events: 0,
        mode: false,
    });

    const [events] = useState<Event[]>([
        { id: "1", title: "Event 1"},
        { id: "2", title: "Event 2"},
        { id: "3", title: "Event 3"}
    ]);

    const handleSave = () => {
        // TODO: API-Call
        setIsEditing(false);
    };

    const handleCancel = () => {
        // TODO: Data reset
        setIsEditing(false);
    };

    const handleDeleteAccount = () => {
        // TODO: Account-Delete
        console.log('Account delete');
    };

    if (isEditing) {
      return (
          <EditView
            userData={userData}
            setUserData={setUserData}
            onSave={handleSave}
            onCancel={handleCancel}
            events={events}
            onDeleteAccount={handleDeleteAccount}
            />
      );
    }

    return (
        <DisplayView
            userData={userData}
            onEdit={() => setIsEditing(true)}
            events={events}
        />
    );
}

function DisplayView({
    userData,
    onEdit,
    events
}: {
    userData: UserData;
    onEdit: () => void;
    events: Event[];
}) {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImageText}>Image</Text>
                    </View>
                </View>
                <View style={styles.profileInfo}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{userData.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Loc</Text>
                        <Text style={styles.value}>{userData.location}</Text>
                    </View>
                    <View style={styles.tabs}>
                        <TouchableOpacity style={styles.tab}>
                            <Text>Friends</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab}>
                            <Text>Events</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab}>
                            <Text>Mode</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Bio */}
            <View style={styles.bioSection}>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.bioText}>{userData.bio}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                    <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
            </View>

            {/* Events List */}
            <View style={styles.eventsList}>
                {events.map((event, index) => (
                    <View key={event.id} style={styles.eventItem}>
                        <Text>Event {index + 1}</Text>
                        <TouchableOpacity style={styles.cancelButton}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

//Edit
function EditView({
    userData,
    setUserData,
    onSave,
    onCancel,
    events,
    onDeleteAccount
}: {
    userData: UserData;
    setUserData: (data:UserData) => void;
    onSave: () => void;
    onCancel: () => void;
    events: Event[];
    onDeleteAccount: () => void;
}) {
    const  handleInputChange = (field: keyof UserData, value: string) => {
        setUserData({ ...userData, [field]: value });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Kontoeinstellungen</Text>

            {/* Profilbereich - Bearbeiten */}
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImageText}>~</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.profileInfo}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={userData.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Location"
                        value={userData.location}
                        onChangeText={(text) => handleInputChange('location', text)}
                    />
                </View>
            </View>

            {/* Bio - Bearbeiten */}
            <View style={styles.bioSection}>
                <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="Bio"
                    value={userData.bio}
                    onChangeText={(text) => handleInputChange('bio', text)}
                    multiline
                    numberOfLines={4}
                />
            </View>

            {/* Save/Cancel Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={onSave}>
                    <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={onCancel}>
                    <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {/* Events Liste */}
            <View style={styles.eventsList}>
                {events.map((event, index) => (
                    <View key={event.id} style={styles.eventItem}>
                        <Text>Event {index + 1}</Text>
                        <TouchableOpacity style={styles.cancelButton}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Delete Account Section */}
            <View style={styles.deleteSection}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDeleteAccount}
                >
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>

                <View style={styles.deleteConfirmation}>
                    <TextInput
                        style={[styles.input, styles.deleteInput]}
                        placeholder="Bestätigung eingeben"
                    />
                    <TextInput
                        style={[styles.input, styles.deleteInput]}
                        placeholder="Passwort"
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.confirmDeleteButton}>
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

