export interface NetroEvent {
    id: number;
    title: string;
    description: string;
    startTime: string;
    location: string;
    imageUrl?: string;
    seriesEvent: boolean;
    frequency: string | null;
    createdByUserId: number;
    categories: string[];
    createdAt: string;
    updatedAt: string;
}