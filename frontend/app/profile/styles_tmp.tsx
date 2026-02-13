import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Container
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    // Loading and Error
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorBanner: {
        backgroundColor: '#fee',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#f00',
    },
    errorText: {
        color: '#c00',
        fontSize: 14,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },

    // Title
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 16,
        color: '#333',
    },

    // Profile Section
    profileSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
    },
    profileImageContainer: {
        marginRight: 16,
        alignItems: 'center',
    },
    profileImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    changePhotoText: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    infoRow: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#333',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },

    // Input
    inputGroup: {
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    bioInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },

    // Bio Section
    bioSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    bioText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
    },

    // Categories
    categoriesSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    categoryButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#333',
    },
    categoryButtonTextSelected: {
        color: '#fff',
    },
    categoryList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    categoryChip: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryChipText: {
        color: '#fff',
        fontSize: 12,
    },

    // Ghost Mode
    ghostModeSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    ghostModeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ghostModeDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },

    // Actions
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    disabledButton: {
        opacity: 0.6,
    },

    // Events List
    eventsList: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    eventItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    eventDetails: {
        fontSize: 12,
        color: '#666',
    },
    cancelEventButton: {
        backgroundColor: '#fee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#fcc',
    },
    cancelEventButtonText: {
        color: '#c00',
        fontSize: 14,
    },
    emptyEventsText: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        paddingVertical: 20,
    },

    // Danger Zone
    dangerZone: {
        backgroundColor: '#fff',
        padding: 16,
        marginTop: 24,
        marginBottom: 32,
        borderTopWidth: 2,
        borderTopColor: '#fdd',
    },
    dangerZoneTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#c00',
        marginBottom: 12,
    },
    deleteButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#f00',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#f00',
        fontWeight: 'bold',
        fontSize: 16,
    },
    deleteConfirmation: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#fef5f5',
        borderRadius: 8,
    },
    deleteWarning: {
        color: '#c00',
        marginBottom: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    deleteInput: {
        marginBottom: 12,
    },
    deleteActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 8,
    },
    confirmDeleteButton: {
        backgroundColor: '#f00',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    cancelDeleteButton: {
        backgroundColor: '#eee',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
});