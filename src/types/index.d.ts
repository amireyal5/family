// This file can be used for shared TypeScript types across the application.

// Corresponds to the user object in the authStore
export interface UserProfile {
    email: string;
    name: string;
    role: 'admin' | 'therapist' | 'secretary' | 'accountant' | 'guard';
}

export type PatientStatus = 'פעיל' | 'לא פעיל' | 'ממתין' | 'סיים טיפול';

// This interface represents the processed data used in the UI components
export interface Patient {
    id: number;
    nationalId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO String format YYYY-MM-DD
    status: PatientStatus;
    therapist: string;
    age: number | null;
}