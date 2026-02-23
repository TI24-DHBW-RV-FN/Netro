
export interface NetroEvent {
    id: number;
    title: string;
    description: string;
    startTime: string;
    location: string;
    seriesEvent: boolean;
    frequency: string | null;
    createdByUserId: number;
    categories: string[];
}