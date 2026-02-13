import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
    getProfileApi,
    updateProfileApi,
    //getCategoriesApi,
    //getUserEventsApi,
    //cancelEventParticipationApi,
    //deleteAccountApi,
    //getFollowerCountApi,
} from './api';
import { UserData, Category, Event } from './types';


export const useSettings = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [userData, setUserData] = useState<UserData>({
        userName: '',
        currentLocation: '',
        bio: '',
        categories: [],
        ghostMode: false,
        profileImage: null,
        followerCount: 0,
        eventCount: 0,
    });

    const [originalUserData, setOriginalUserData] = useState<UserData | null>(null);
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        await Promise.all([
            loadProfile(),
            //loadAvailableCategories(),
            //loadUserEvents(),
        ]);
    };

    /**
     * Load Profile
     */
    const loadProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const response = await getProfileApi(token);

            if (response.success && response.user) {
                // Fetch follower count separately
                let followerCount = 0;
                /*try {
                    const followerResponse = await getFollowerCountApi(token);
                    followerCount = followerResponse.count || 0;
                } catch (err) {
                    console.error('Failed to fetch follower count:', err);
                }*/

                const profileData: UserData = {
                    userName: response.user.userName || '',
                    currentLocation: response.user.currentLocation || '',
                    bio: response.user.bio || '',
                    categories: response.user.categories?.map((cat) => cat.name) || [],
                    ghostMode: false, // TODO: Add to backend
                    profileImage: null,
                    followerCount: response.user.followerCount || followerCount,
                    eventCount: response.user.eventCount || 0,
                };

                setUserData(profileData);
                setOriginalUserData(profileData);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Load available categories from backend

    const loadAvailableCategories = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            const response = await getCategoriesApi(token);

            if (response.success) {
                setAvailableCategories(response.categories || []);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
        }
    };
     */
    /**
     * Load user's events from backend

    const loadUserEvents = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            const response = await getUserEventsApi(token);

            if (response.success) {
                setEvents(response.events || []);

                // Update event count in user data
                setUserData((prev) => ({
                    ...prev,
                    eventCount: response.total || response.events?.length || 0,
                }));
            }
        } catch (err) {
            console.error('Failed to load events:', err);
        }
    };
     */

    /**
     * Save profile changes to backend
     */
    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);

            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const response = await updateProfileApi(token, {
                userName: userData.userName,
                currentLocation: userData.currentLocation,
                bio: userData.bio,
                categories: userData.categories,
            });

            if (response.success) {
                setOriginalUserData(userData);
                setIsEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            } else {
                throw new Error(response.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Failed to save profile:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
            setError(errorMessage);
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Cancel editing and restore original data
     */
    const handleCancel = () => {
        if (originalUserData) {
            setUserData(originalUserData);
        }
        setIsEditing(false);
        setError(null);
    };

    /**
     * Toggle category selection

    const toggleCategory = (categoryName: string) => {
        setUserData((prev) => ({
            ...prev,
            categories: prev.categories.includes(categoryName)
                ? prev.categories.filter((c) => c !== categoryName)
                : [...prev.categories, categoryName],
        }));
    };
     */
    /**
     * Cancel event participation

    const handleCancelEvent = async (eventId: string) => {
        Alert.alert(
            'Cancel Event',
            'Are you sure you want to cancel your participation in this event?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('authToken');
                            if (!token) throw new Error('No token found');

                            const response = await cancelEventParticipationApi(token, { eventId });

                            if (response.success) {
                                Alert.alert('Success', 'Event participation cancelled');
                                await loadUserEvents();
                            } else {
                                throw new Error(response.message);
                            }
                        } catch (err) {
                            console.error('Failed to cancel event:', err);
                            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to cancel event');
                        }
                    },
                },
            ]
        );
    };
     */
    /**
     * Handle account deletion with re-authentication

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                        setShowDeleteConfirmation(false);
                        setDeletePassword('');
                    },
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setShowDeleteConfirmation(true),
                },
            ]
        );
    };
     */
    /**
     * Confirm account deletion with password verification

    const confirmDeleteAccount = async () => {
        try {
            if (!deletePassword) {
                Alert.alert('Error', 'Please enter your password to confirm deletion');
                return;
            }

            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await deleteAccountApi(token, { password: deletePassword });

            if (response.success) {
                await AsyncStorage.removeItem('authToken');
                Alert.alert('Success', 'Account deleted successfully', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login'),
                    },
                ]);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error('Failed to delete account:', err);
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete account');
        } finally {
            setShowDeleteConfirmation(false);
            setDeletePassword('');
        }
    };
     */

    /**
     * Start editing
     */
    const handleEdit = () => {
        setIsEditing(true);
    };

    /**
     * Update data field
     */
    const updateUserData = (field: keyof UserData, value: string | boolean | string[]) => {
        setUserData((prev) => ({ ...prev, [field]: value }));
    };

    return {
        // State
        isEditing,
        isLoading,
        isSaving,
        error,
        userData,
        availableCategories,
        events,
        showDeleteConfirmation,
        deletePassword,

        // Actions
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
    };
};