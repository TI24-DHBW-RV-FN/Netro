// backend/types/event.ts
export interface NetroEvent {
    id: number;
    title: string;
    description: string;
    startTime: string;
    location: string;
    seriesEvent: boolean;
    frequency: string | null;
    createdAt: string;
    updatedAt: string;
    createdByUserId: number;
    categories: string[];
}