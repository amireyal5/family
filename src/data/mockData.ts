

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Patient, Therapist, Appointment, Profile, ActionLogEntry, KnowledgeBaseArticle, Payment, OneTimeCharge, Refund, Room, RoomBooking } from '../types';
import moment from 'moment';

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const today_date = new Date();
const today_formatted = today_date.toISOString().split('T')[0];

export const mockUsers: Profile[] = [
    { id: 'user_admin', full_name: 'מנהל המערכת', role: 'מנהל/ת', created_at: now },
    { id: 'user_therapist_1', full_name: 'ד"ר רחל כהן', role: 'מטפל/ת', created_at: now },
    { id: 'user_secretary', full_name: 'מזכירה ראשית', role: 'מזכירה', created_at: now },
    { id: 'user_accountant', full_name: 'רו"ח גדי כספי', role: 'תחשיבנית', created_at: now},
    { id: 'user_guard', full_name: 'שומר הכניסה', role: 'שומר', created_at: now},
];

const auditInfoDefault = {
  createdAt: yesterday,
  createdBy: 'מנהל המערכת',
  updatedAt: now,
  updatedBy: 'מנהל המערכת',
};

export const mockTherapists: Therapist[] = [
  { id: 'therapist_1', name: 'ד"ר רחל כהן', licenseNumber: '27-12345', specialties: ['טיפול זוגי', 'טראומה'], ...auditInfoDefault },
  { id: 'therapist_2', name: 'יוסי לוי', licenseNumber: '27-54321', specialties: ['הדרכת הורים'], ...auditInfoDefault },
  { id: 'therapist_3', name: 'אפרת גורן', licenseNumber: '27-98765', specialties: ['CBT', 'טיפול פרטני'], ...auditInfoDefault },
];


export const mockPatients: Patient[] = [
  {
    id: '123456789',
    idNumber: '123456789',
    firstName: 'ישראל',
    lastName: 'ישראלי',
    address: 'הרצל 10, תל אביב',
    birthDate: '1980-05-15',
    gender: 'זכר',
    phone: '050-1234567',
    email: 'israel@example.com',
    notes: 'מטופל ותיק, הגיע בעקבות המלצה.',
    therapeuticCenter: 'מרכז למשפחה',
    therapist: 'ד"ר רחל כהן',
    treatmentType: 'טיפול משפחתי',
    referralDate: '2023-07-20',
    startDate: '2023-08-01',
    endDate: '',
    rateHistory: [
        { startDate: '2023-08-01', rate: 600, ...auditInfoDefault },
        { startDate: '2024-01-15', rate: 650, ...auditInfoDefault, createdBy: 'מנהל המערכת' }
    ],
    status: 'בטיפול',
    statusHistory: [
        { date: '2023-08-01', status: 'בטיפול', changedBy: 'מנהל המערכת'}
    ],
    paymentTier: 1,
    referringEntity: 'עצמי',
    paymentCommittee: false,
    transactions: [
        { id: 'p1_1', type: 'payment', date: '2023-08-05', amount: 600, forMonths: 'אוגוסט 2023', method: 'כרטיס אשראי', collector: 'מזכירה ראשית', ...auditInfoDefault } as Payment,
        { id: 'p1_2', type: 'payment', date: '2023-09-04', amount: 600, forMonths: 'ספטמבר 2023', method: 'העברה בנקאית', collector: 'מזכירה ראשית', ...auditInfoDefault } as Payment,
        { id: 'c1_1', type: 'charge', date: '2023-10-10', amount: 250, description: 'כתיבת חוות דעת', issuedBy: 'ד"ר רחל כהן', ...auditInfoDefault } as OneTimeCharge
    ],
    discounts: [
        {
            id: 'disc_1',
            requestDate: '2023-09-05',
            requester: 'ד"ר רחל כהן',
            reason: 'מצב סוציו-אקונומי קשה',
            type: 'fixed_amount',
            value: 100,
            validFrom: '2023-09-01',
            validUntil: '2024-03-31',
            status: 'מאושר',
            approver: 'מנהל המערכת',
            decisionDate: '2023-09-06',
            notes: 'הנחה קבועה לחצי שנה',
            ...auditInfoDefault,
        }
    ],
    relationships: [
        { relatedPatientId: '987654321', relationshipType: 'טיפול זוגי'}
    ],
    clinicalNotes: [],
    history: [],
    ...auditInfoDefault
  },
  {
    id: '987654321',
    idNumber: '987654321',
    firstName: 'יעל',
    lastName: 'לוי',
    address: 'זבוטינסקי 5, חיפה',
    birthDate: '1992-11-20',
    gender: 'נקבה',
    phone: '052-7654321',
    email: 'yael.levi@example.com',
    notes: 'פיצול תשלום עם משה אבידן',
    therapeuticCenter: 'טיפול באלימות',
    therapist: 'ד"ר רחל כהן',
    treatmentType: 'טיפול זוגי',
    referralDate: '2023-07-01',
    startDate: '2023-07-15',
    endDate: '',
    rateHistory: [{ startDate: '2023-07-15', rate: 700, ...auditInfoDefault }],
    status: 'בטיפול',
    statusHistory: [
        { date: '2023-07-15', status: 'בטיפול', changedBy: 'מנהל המערכת' }
    ],
    paymentTier: 4,
    referringEntity: 'קופת חולים',
    paymentCommittee: true,
    billingInfo: {
        splitWithPatientId: '234567890', // Moshe Avidan's ID
        splitPercentage: 50
    },
    transactions: [
      { id: 'p2_1', type: 'payment', date: '2023-09-10', amount: 350, forMonths: 'ספטמבר 2023', method: 'ביט', collector: 'מזכירה ראשית', ...auditInfoDefault } as Payment
    ],
    discounts: [],
    relationships: [
        { relatedPatientId: '123456789', relationshipType: 'טיפול זוגי' },
        { relatedPatientId: '234567890', relationshipType: 'שותף לטיפול זוגי'}
    ],
    clinicalNotes: [],
    history: [],
    ...auditInfoDefault
  },
  {
    id: '234567890',
    idNumber: '234567890',
    firstName: 'משה',
    lastName: 'אבידן',
    address: 'ביאליק 8, ירושלים',
    birthDate: '1975-02-10',
    gender: 'זכר',
    phone: '054-1122334',
    email: 'moshe.av@example.com',
    notes: 'הופנה על ידי שירותי הרווחה. בטיפול זוגי עם יעל לוי.',
    therapeuticCenter: 'טיפול באלימות',
    therapist: 'ד"ר רחל כהן',
    treatmentType: 'טיפול זוגי',
    referralDate: '2023-09-01',
    startDate: '2023-07-15', // Same start date as Yael
    endDate: '',
    rateHistory: [], // Rate is determined by Yael's patient record
    status: 'בטיפול',
    statusHistory: [
        { date: '2023-07-15', status: 'בטיפול', changedBy: 'מנהל המערכת' }
    ],
    paymentTier: 1,
    referringEntity: 'משרד הרווחה',
    paymentCommittee: false,
    transactions: [
      { id: 'p3_1', type: 'payment', date: '2023-09-10', amount: 350, forMonths: 'ספטמבר 2023', method: 'מזומן', collector: 'ד"ר רחל כהן', ...auditInfoDefault } as Payment
    ],
    discounts: [],
    relationships: [
        { relatedPatientId: '987654321', relationshipType: 'שותף לטיפול זוגי'}
    ],
    clinicalNotes: [],
    history: [],
    ...auditInfoDefault
  },
  {
    id: '345678901',
    idNumber: '345678901',
    firstName: 'שרה',
    lastName: 'שור',
    address: 'הנרקיסים 12, רעננה',
    birthDate: '2001-01-30',
    gender: 'נקבה',
    phone: '053-9988776',
    email: 'sara.shor@example.com',
    notes: 'סטודנטית, מבקשת טיפול מוזל.',
    therapeuticCenter: 'מרכז למשפחה',
    therapist: 'אפרת גורן',
    treatmentType: 'טיפול פרטני',
    referralDate: '2023-09-15',
    startDate: '2023-10-01',
    endDate: '',
    rateHistory: [{ startDate: '2023-10-01', rate: 300, ...auditInfoDefault }],
    status: 'בהמתנה לטיפול',
    statusHistory: [
        { date: '2023-09-15', status: 'בהמתנה לטיפול', changedBy: 'הפנייה ציבורית' }
    ],
    paymentTier: 6,
    referringEntity: 'עצמי',
    paymentCommittee: true,
    transactions: [],
    discounts: [
        {
            id: 'disc_2_pending',
            requestDate: now,
            requester: 'אפרת גורן',
            reason: 'סטודנטית, הכנסה נמוכה',
            type: 'percentage',
            value: 20,
            validFrom: '2023-10-01',
            validUntil: '2024-09-30',
            status: 'ממתין לאישור',
            ...auditInfoDefault,
        }
    ],
    relationships: [],
    clinicalNotes: [],
    history: [],
    ...auditInfoDefault
  },
   {
    id: '456789012',
    idNumber: '456789012',
    firstName: 'דני',
    lastName: 'כהן',
    address: 'הנביאים 20, באר שבע',
    birthDate: '1988-03-25',
    gender: 'זכר',
    phone: '058-1234567',
    email: 'dani.c@example.com',
    notes: 'הפסיק טיפול מיוזמתו.',
    therapeuticCenter: 'טיפול באלימות',
    therapist: 'יוסי לוי',
    treatmentType: 'טיפול פרטני',
    referralDate: '2023-05-01',
    startDate: '2023-05-10',
    endDate: '2023-08-10',
    rateHistory: [{ startDate: '2023-05-10', rate: 500, ...auditInfoDefault }],
    status: 'הופסק',
    statusHistory: [
        { date: '2023-05-10', status: 'בטיפול', changedBy: 'מנהל המערכת' },
        { date: '2023-08-10', status: 'הופסק', changedBy: 'יוסי לוי' }
    ],
    paymentTier: 2,
    referringEntity: 'עצמי',
    paymentCommittee: false,
    transactions: [
         { id: 'p4_1', type: 'payment', date: '2023-05-10', amount: 500, forMonths: 'מאי 2023', method: 'ביט', collector: 'מזכירה ראשית', ...auditInfoDefault } as Payment,
         { id: 'r4_1', type: 'refund', date: '2023-06-15', amount: 100, reason: 'זיכוי על פגישה שבוטלה', processedBy: 'מזכירה ראשית', ...auditInfoDefault } as Refund
    ],
    discounts: [],
    relationships: [],
    clinicalNotes: [],
    history: [],
    ...auditInfoDefault
  },
];

const currentYear = today_date.getFullYear();
const currentMonth = today_date.getMonth();
const currentDay = today_date.getDate();

export const mockAppointments: Appointment[] = [
    // Today's appointments for GuardView
    { id: 'app_1', title: 'פגישה - ישראל ישראלי', patientId: '123456789', therapistId: 'therapist_1', start: new Date(currentYear, currentMonth, currentDay, 10, 0), end: new Date(currentYear, currentMonth, currentDay, 11, 0), checkedIn: false, ...auditInfoDefault, createdBy: 'ד"ר רחל כהן', updatedBy: 'ד"ר רחל כהן' },
    { id: 'app_2', title: 'פגישה - יעל לוי ומשה אבידן', patientId: '987654321', therapistId: 'therapist_1', start: new Date(currentYear, currentMonth, currentDay, 12, 0), end: new Date(currentYear, currentMonth, currentDay, 13, 0), checkedIn: false, ...auditInfoDefault, createdBy: 'ד"ר רחל כהן', updatedBy: 'ד"ר רחל כהן' },
    { id: 'app_3', title: 'פגישה - שרה שור', patientId: '345678901', therapistId: 'therapist_3', start: new Date(currentYear, currentMonth, currentDay, 14, 30), end: new Date(currentYear, currentMonth, currentDay, 15, 30), checkedIn: true, ...auditInfoDefault, createdBy: 'אפרת גורן', updatedBy: 'מזכירה ראשית' },
    
    // Future/Past appointments for CalendarView
    { id: 'app_4', title: 'פגישה - יעל לוי', patientId: '987654321', therapistId: 'therapist_2', start: new Date(currentYear, currentMonth, currentDay - 5, 11, 0), end: new Date(currentYear, currentMonth, currentDay - 5, 12, 0), checkedIn: true, ...auditInfoDefault },
    { id: 'app_5', title: 'פגישה - ישראל ישראלי', patientId: '123456789', therapistId: 'therapist_1', start: new Date(currentYear, currentMonth, currentDay + 2, 10, 0), end: new Date(currentYear, currentMonth, currentDay + 2, 11, 0), checkedIn: false, ...auditInfoDefault },
    { id: 'app_6', title: 'פגישה - משה אבידן', patientId: '234567890', therapistId: 'therapist_1', start: new Date(currentYear, currentMonth, 10, 16, 0), end: new Date(currentYear, currentMonth, 10, 17, 0), checkedIn: false, ...auditInfoDefault },
    { id: 'app_7', title: 'יוסי - חופשה', therapistId: 'therapist_2', start: new Date(currentYear, currentMonth, 14), end: new Date(currentYear, currentMonth, 16), allDay: true, checkedIn: false, ...auditInfoDefault },
];

export const mockActionLog: ActionLogEntry[] = [
    { id: 'log1', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), user: 'מנהל המערכת', patientId: '123456789', type: 'rate-change', details: 'התעריף שונה ל-₪650 החל מתאריך 15/01/2024' },
    { id: 'log2', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), user: 'מנהל המערכת', patientId: '123456789', type: 'discount-decision', details: 'הנחה בסך ₪100 אושרה' },
    { id: 'log3', timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), user: 'ד"ר רחל כהן', patientId: '123456789', type: 'discount-request', details: 'הוגשה בקשה להנחה בסך ₪100' },
    { id: 'log4', timestamp: new Date().toISOString(), user: 'אפרת גורן', patientId: '345678901', type: 'discount-request', details: 'הוגשה בקשה להנחה של 20%' },
];

export const mockKnowledgeBaseArticles: KnowledgeBaseArticle[] = [
    {
        id: 'kb_1',
        title: 'נוהל פתיחת תיק מטופל חדש',
        category: 'נהלי משרד',
        content: `בעת קליטת מטופל חדש למערכת, יש לבצע את הצעדים הבאים:\n\n1. וידוא קבלת טופס הפניה חתום.\n2. הזנת פרטים דמוגרפיים מלאים בטופס הוספת מטופל.\n3. קביעת תעריף ראשוני ודרגת תשלום בהתאם למסמכים.\n4. שיבוץ ראשוני למטפל/ת מתאים/ה בהתייעצות עם רכז/ת המרכז.\n5. קביעת פגישת אינטייק ראשונית ביומן.`,
        ...auditInfoDefault
    },
    {
        id: 'kb_2',
        title: 'נוהל בקשת הנחה',
        category: 'נהלים פיננסיים',
        content: `בקשות להנחה יוגשו אך ורק דרך לשונית "ניהול פיננסי" בתיק המטופל.\n\n- כל בקשה חייבת לכלול סיבה ברורה ומפורטת.\n- יש להגדיר את סוג ההנחה (אחוז או סכום קבוע) ואת תקופת התוקף המבוקשת.\n- לאחר הגשת הבקשה, היא תועבר לאישור מנהל/ת המערכת.\n- אין להבטיח למטופל הנחה טרם קבלת אישור רשמי במערכת.`,
         ...auditInfoDefault
    },
    {
        id: 'kb_3',
        title: 'טיפול במקרי חירום',
        category: 'נהלים קליניים',
        content: `בכל מקרה של חשש לאובדנות או סכנה מיידית למטופל או לסביבתו, יש לפעול לפי הנהלים הבאים:\n\n1. אין להשאיר את המטופל לבד.\n2. יש ליצור קשר מיידי עם הפסיכיאטר המחוזי התורן.\n3. יש לעדכן את מנהל/ת המרכז במקביל.\n4. יש לתעד את האירוע באופן מפורט בתיק המטופל תחת "תיעוד קליני" فوراً בסיום האירוע.`,
         ...auditInfoDefault
    },
     {
        id: 'kb_4',
        title: 'שימוש ביומן הפגישות',
        category: 'שימוש במערכת',
        content: `יומן הפגישות מאפשר תצוגה וניהול של כלל הפעילות במרכז.\n\n- לקביעת פגישה חדשה, יש ללחוץ על משבצת זמן פנויה.\n- ניתן לסנן את תצוגת היומן לפי מטפל או מרכז טיפולי.\n- כל פגישה חייבת להיות משויכת למטפל/ת. שיוך למטופל הוא אופציונלי (למשל, עבור חופשות או ישיבות צוות).\n- שינויים בפגישות נשמרים אוטומטית.`,
         ...auditInfoDefault
    }
];

export const mockRooms: Room[] = [
  { id: 'room_1', name: 'חדר 1', location: 'קומה א׳' },
  { id: 'room_2', name: 'חדר 2', location: 'קומה א׳' },
  { id: 'room_3', name: 'חדר טיפול זוגי', location: 'קומת קרקע' },
  { id: 'room_4', name: 'חדר ישיבות', location: 'קומה ב׳' }
];

export const mockRoomBookings: RoomBooking[] = [
  // Today's bookings
  {
    id: 'rb_1',
    date: today_formatted,
    startTime: '09:00',
    endTime: '10:00',
    roomId: 'room_1',
    therapistId: 'therapist_1',
    notes: 'פגישה עם ישראל ישראלי',
    isBlocked: false,
    ...auditInfoDefault
  },
  {
    id: 'rb_2',
    date: today_formatted,
    startTime: '10:00',
    endTime: '11:00',
    roomId: 'room_2',
    therapistId: 'therapist_2',
    isBlocked: false,
    ...auditInfoDefault
  },
  {
    id: 'rb_3',
    date: today_formatted,
    startTime: '12:00',
    endTime: '13:00',
    roomId: 'room_1',
    isBlocked: true,
    notes: 'חיטוי וניקיון',
    ...auditInfoDefault
  },
  // Another day's booking
   {
    id: 'rb_4',
    date: moment().add(1, 'day').format('YYYY-MM-DD'),
    startTime: '14:00',
    endTime: '15:30',
    roomId: 'room_3',
    therapistId: 'therapist_1',
    notes: 'טיפול זוגי',
    isBlocked: false,
    ...auditInfoDefault
  }
];