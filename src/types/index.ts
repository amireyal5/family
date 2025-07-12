/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'מנהל/ת' | 'מטפל/ת' | 'מזכירה' | 'תחשיבנית' | 'שומר';
export type TherapeuticCenter = 'מרכז למשפחה' | 'טיפול באלימות' | 'מרכז להורות' | 'לא שויך';

export interface AuditInfo {
    createdAt: string; // ISO String
    createdBy: string; // User Name
    updatedAt: string; // ISO String
    updatedBy: string; // User Name
}

export interface User {
    id: string;
    name: string;
    role: Role;
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
};

export type PatientStatus = 'בטיפול' | 'בהמתנה לטיפול' | 'הופסק' | 'הסתיים בהצלחה' | 'סיום טיפול' | 'מוקפא';

export interface StatusHistoryEntry {
    date: string; // YYYY-MM-DD
    status: PatientStatus;
    changedBy: string; // User Name
    notes?: string;
}

export type TransactionType = 'payment' | 'charge' | 'refund';

export interface Transaction extends AuditInfo {
    id: string;
    date: string; // YYYY-MM-DD
    amount: number;
    type: TransactionType;
    notes?: string;
}

export interface Payment extends Transaction {
    type: 'payment';
    forMonths: string; // e.g., "January 2024"
    method: 'מזומן' | 'כרטיס אשראי' | 'העברה בנקאית' | 'צ׳ק' | 'ביט' | 'אחר';
    collector: string; // Name of the person who collected payment (auto-filled)
}

export interface OneTimeCharge extends Transaction {
    type: 'charge';
    description: string; // e.g., "Late cancellation fee", "Report writing"
    issuedBy: string; // User name
}

export interface Refund extends Transaction {
    type: 'refund';
    reason: string;
    processedBy: string; // User name
    originalTransactionId?: string; // Optional link to an original payment
}


export interface Discount extends AuditInfo {
    id: string;
    requestDate: string; // YYYY-MM-DD
    requester: string;
    reason: string;
    
    type: 'percentage' | 'fixed_amount';
    value: number; // The percentage value (e.g., 10 for 10%) or the fixed amount
    
    validFrom: string; // YYYY-MM-DD
    validUntil: string; // YYYY-MM-DD
    
    status: 'ממתין לאישור' | 'מאושר' | 'נדחה';
    approver?: string; // User Name
    decisionDate?: string; // YYYY-MM-DD
    notes?: string; // Can be used for approver notes or general notes
}


export interface ClinicalNote extends AuditInfo {
    id: string;
    date: string; // ISO String for when the session happened, not createdAt
    author: string;
    content: string;
}

// Represents a snapshot of the patient data at a certain point in time
export interface PatientHistoryEntry {
    updatedAt: string;
    updatedBy: string;
    patientData: Patient;
}

export interface RateHistoryEntry {
    startDate: string; // YYYY-MM-DD
    rate: number;
    createdAt: string;
    createdBy: string;
}

export interface BillingInfo {
    splitWithPatientId?: string;
    // The percentage THIS patient pays (e.g., 60 for 60%). The other patient pays the remainder.
    splitPercentage?: number; 
}

export type ActionLogType = 'rate-change' | 'discount-request' | 'discount-decision' | 'billing-split-update' | 'status-change' | 'transaction-add' | 'relationship-change';

export interface ActionLogEntry {
    id: string;
    timestamp: string; // ISO string
    user: string; // User name
    patientId?: string;
    type: ActionLogType;
    details: string; // e.g., "Rate changed to 550", "Approved 100 NIS discount"
}

export interface Relationship {
    relatedPatientId: string;
    // e.g., 'בן/בת זוג', 'הורה', 'ילד/ה'
    relationshipType: string;
}

export interface Room {
    id: string;
    name: string;
    location?: string;
}

export interface RoomBooking extends AuditInfo {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    roomId: string;
    therapistId?: string;
    notes?: string;
    isBlocked: boolean;
}

export interface Patient extends AuditInfo {
    // Personal Details (from form 1.2)
    id: string; // Unique and required
    firstName: string;
    lastName: string;
    idNumber: string; // Added this field for unique identification
    address: string;
    birthDate: string; // Stored as YYYY-MM-DD for date inputs
    gender: 'זכר' | 'נקבה' | 'אחר';
    phone: string;
    email: string;
    notes?: string;

    // Treatment Details (from form 1.3)
    therapeuticCenter: TherapeuticCenter;
    therapist: string;
    treatmentType: string;
    referralDate: string; // YYYY-MM-DD
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    rateHistory: RateHistoryEntry[];
    status: PatientStatus;
    statusHistory: StatusHistoryEntry[];
    paymentTier: number;
    referringEntity?: string; // גורם מפנה
    paymentCommittee?: boolean; // הועדת תשלום
    reasonForReferral?: string; // For new referrals from public form
    
    // Financial Details
    billingInfo?: BillingInfo;
    transactions: (Payment | OneTimeCharge | Refund)[];
    discounts: Discount[];
    
    // Clinical Documentation
    clinicalNotes: ClinicalNote[];

    // Family Connections
    relationships: Relationship[];
    
    // Audit Trail
    history: PatientHistoryEntry[];
}

export interface Therapist extends AuditInfo {
    id: string;
    name: string;
    licenseNumber?: string;
    specialties?: string[];
}

export interface Appointment extends AuditInfo {
    id:string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    patientId?: string;
    therapistId: string;
    checkedIn: boolean;
}

export interface KnowledgeBaseArticle extends AuditInfo {
    id: string;
    title: string;
    category: string;
    content: string; // Markdown content
}