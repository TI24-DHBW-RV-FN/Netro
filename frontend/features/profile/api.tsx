import { env } from '../../config/env';
import {
    ProfileResponse,
    UpdateProfileRequest,
    UpdateProfileResponse,
    DeleteAccountRequest,
    DeleteAccountResponse,
    CategoriesResponse,
    EventsResponse,
    CancelEventRequest,
    CancelEventResponse,
} from './types';

/**
 * Fetch Data
 */
export const getProfileApi = async (token: string): Promise<ProfileResponse> => {
    const response = await fetch(`${env.apiUrlProfil}/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch profile');
    }

    return response.json();
};

/**
 * Update Profile
 */
export const updateProfileApi = async (
    token: string,
    data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
    const response = await fetch(`${env.apiUrlProfil}/edit/profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update profile (${response.status})`);
    }

    return response.json();
};

/**
 * Fetch Categories

 export const getCategoriesApi = async (token: string): Promise<CategoriesResponse> => {
 const response = await fetch(`${env.apiUrlProfil}/categories`, {
 method: 'GET',
 headers: {
 'Authorization': `Bearer ${token}`,
 },
 });

 if (!response.ok) {
 const error = await response.json().catch(() => ({}));
 throw new Error(error.message || 'Failed to fetch categories');
 }

 return response.json();
 };
 */

/**
 * Fetch Events

 export const getUserEventsApi = async (token: string): Promise<EventsResponse> => {
 const response = await fetch(`${env.apiUrlProfil}/events/my-events`, {
 method: 'GET',
 headers: {
 'Authorization': `Bearer ${token}`,
 },
 });

 if (!response.ok) {
 const error = await response.json().catch(() => ({}));
 throw new Error(error.message || 'Failed to fetch events');
 }

 return response.json();
 };
 */

/**
 * Cancel Event

 export const cancelEventParticipationApi = async (
 token: string,
 data: CancelEventRequest
 ): Promise<CancelEventResponse> => {
 const response = await fetch(`${env.apiUrlProfil}/events/cancel-participation`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`,
 },
 body: JSON.stringify(data),
 });

 if (!response.ok) {
 const error = await response.json().catch(() => ({}));
 throw new Error(error.message || 'Failed to cancel event participation');
 }

 return response.json();
 };
 */


/**
 * DeleteAccount

 export const deleteAccountApi = async (
 token: string,
 data: DeleteAccountRequest
 ): Promise<DeleteAccountResponse> => {
 const response = await fetch(`${env.apiUrlProfil}/delete-account`, {
 method: 'DELETE',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`,
 },
 body: JSON.stringify(data),
 });

 if (!response.ok) {
 const error = await response.json().catch(() => ({}));
 throw new Error(error.message || 'Failed to delete account');
 }

 return response.json();
 };
 */
/**
 * Followercount

 export const getFollowerCountApi = async (token: string): Promise<{ success: boolean; count: number }> => {
 const response = await fetch(`${env.apiUrlProfil}/followers/count`, {
 method: 'GET',
 headers: {
 'Authorization': `Bearer ${token}`,
 },
 });

 if (!response.ok) {
 const error = await response.json().catch(() => ({}));
 throw new Error(error.message || 'Failed to fetch follower count');
 }

 return response.json();
 };
 */