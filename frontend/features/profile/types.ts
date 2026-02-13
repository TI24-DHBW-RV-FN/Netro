export interface UserData {
    userName: string;
    currentLocation: string;
    bio: string;
    categories: string[];
    ghostMode: boolean;
    profileImage: string | null;
    followerCount: number;
    eventCount: number;
}

export interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    description?: string;
    participantCount?: number;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface ProfileResponse {
    success: boolean;
    user?: {
        id: number;
        userName: string;
        currentLocation: string;
        bio: string;
        createdAt: string;
        updatedAt: string;
        lastLogin: string;
        categories: Category[];
        followerCount?: number;
        eventCount?: number;
    };
    message?: string;
}

export interface UpdateProfileRequest {
    userName?: string;
    currentLocation?: string;
    bio?: string;
    categories?: string[];
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    user?: {
        id: number;
        email: string;
        userName: string;
        currentLocation: string;
        bio: string;
        categories: string[];
        updatedAt: string;
    };
}

export interface DeleteAccountRequest {
    password: string;
}

export interface DeleteAccountResponse {
    success: boolean;
    message: string;
}

export interface CategoriesResponse {
    success: boolean;
    categories: Category[];
}

export interface EventsResponse {
    success: boolean;
    events: Event[];
    total: number;
}

export interface CancelEventRequest {
    eventId: string;
    reason?: string;
}

export interface CancelEventResponse {
    success: boolean;
    message: string;
}