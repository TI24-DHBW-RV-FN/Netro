
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSettings } from '../../features/profile';
import { DisplayView } from './displayView';
import { EditView } from './editView';
import { styles } from './styles_tmp';

export default function SettingsScreen() {
    const {
        isEditing,
        isLoading,
        isSaving,
        error,
        userData,
        availableCategories,
        events,
        showDeleteConfirmation,
        deletePassword,
        handleEdit,
        handleSave,
        handleCancel,
        //toggleCategory,
        //handleCancelEvent,
        //handleDeleteAccount,
        //confirmDeleteAccount,
        setDeletePassword,
        updateUserData,
        loadProfile,
    } = useSettings();


    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (error && !isEditing) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={loadProfile} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isEditing) {
        return (
            <EditView
                userData={userData}
                availableCategories={availableCategories}
                events={events}
                error={error}
                isSaving={isSaving}
                showDeleteConfirmation={showDeleteConfirmation}
                deletePassword={deletePassword}
                onUpdateUserData={updateUserData}
                onToggleCategory={() => {}}
                onSave={handleSave}
                onCancel={handleCancel}
                onCancelEvent={() => {}}
                onDeleteAccount={() => {}}
                onConfirmDelete={() => {}}
                setDeletePassword={setDeletePassword}
            />
        );
    }

    return (
        <DisplayView
            userData={userData}
            events={events}
            onEdit={handleEdit}
            onCancelEvent={() => {}}
        />
    );
}