/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { create } from 'zustand';
import { 
    mockPatients, 
    mockTherapists, 
    mockAppointments, 
    mockActionLog, 
    mockKnowledgeBaseArticles,
    mockRooms,
    mockRoomBookings,
} from './data/mockData';
import { 
    Patient, 
    Therapist, 
    Appointment, 
    Role,
    ActionLogEntry,
    Discount,
    Payment,
    OneTimeCharge,
    Refund,
    Relationship,
    KnowledgeBaseArticle,
    Room,
    RoomBooking,
    ClinicalNote,
    Profile,
} from './types';
import moment from 'moment';

interface ClinicState {
  // Auth & UI State
  view: string;
  selectedPatientId: string | null;
  drawerOpen: boolean;
  snackbar: { open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' };
  userMenuAnchor: null | HTMLElement;
  isImporting: boolean;

  // Data State
  patients: Patient[];
  therapists: Therapist[];
  appointments: Appointment[];
  actionLog: ActionLogEntry[];
  knowledgeBase: KnowledgeBaseArticle[];
  rooms: Room[];
  roomBookings: RoomBooking[];
  
  // Actions
  setView: (view: string) => void;
  setSelectedPatientId: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  closeSnackbar: () => void;
  setUserMenuAnchor: (anchor: null | HTMLElement) => void;
  setIsImporting: (importing: boolean) => void;
  
  savePatient: (updatedPatient: Patient, user: Profile) => void;
  addPatient: (patientData: Omit<Patient, 'transactions' | 'clinicalNotes'| 'discounts' | 'history' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'rateHistory' | 'statusHistory' | 'relationships'> & {initialRate: number}, user: Profile) => void;
  importPatients: (importedPatients: Patient[]) => void;
  
  saveAppointment: (app: Omit<Appointment, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>, user: Profile) => void;
  deleteAppointment: (appointmentId: string) => void;
  checkIn: (appointmentId: string, checkedIn: boolean) => void;
  
  addTransaction: (patientId: string, transactionData: Omit<Payment | OneTimeCharge | Refund, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>, user: Profile) => void;
  addClinicalNote: (patientId: string, content: string, user: Profile) => void;

  requestDiscount: (patientId: string, discountRequest: Omit<Discount, 'id'|'status'|'requester'|'createdAt'|'createdBy'|'updatedAt'|'updatedBy'| 'approver' | 'decisionDate' | 'notes'>, user: Profile) => void;
  updateDiscountStatus: (patientId: string, discountId: string, status: 'מאושר' | 'נדחה', user: Profile) => void;
  
  setSplitBilling: (patientId: string, splitWithId: string, percentage: number, user: Profile) => void;
  removeSplitBilling: (patientId: string, user: Profile) => void;
  
  addRelationship: (patientId: string, relationship: Relationship, user: Profile) => void;
  removeRelationship: (patientId: string, relatedPatientId: string, user: Profile) => void;
  
  updateUserRole: (userId: string, newRole: Role) => void;
  addUser: (userData: { name: string, role: Role }) => void;
  addTherapist: (therapistData: Omit<Therapist, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>, user: Profile) => void;

  submitReferral: (referralData: Partial<Patient>) => void;

  addRoom: (roomData: Omit<Room, 'id'>) => void;
  saveRoomBooking: (booking: Omit<RoomBooking, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { id?: string }, user: Profile) => void;
  deleteRoomBooking: (booking: Pick<RoomBooking, 'date' | 'startTime' | 'roomId'>) => void;
}

const auditInfo = (user: Profile) => ({
    createdAt: new Date().toISOString(),
    createdBy: user.full_name,
    updatedAt: new Date().toISOString(),
    updatedBy: user.full_name,
});

export const useClinicStore = create<ClinicState>((set, get) => {
    const logAction = (user: Profile, type: ActionLogEntry['type'], details: string, patientId?: string) => {
        const newLog: ActionLogEntry = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: user.full_name,
            type,
            details,
            patientId
        };
        set(state => ({ actionLog: [newLog, ...state.actionLog] }));
    };

    return {
        // Initial state
        view: 'login', // Start at login screen
        selectedPatientId: null,
        drawerOpen: false,
        snackbar: { open: false, message: '', severity: 'info' },
        userMenuAnchor: null,
        isImporting: false,
        patients: mockPatients,
        therapists: mockTherapists,
        appointments: mockAppointments,
        actionLog: mockActionLog,
        knowledgeBase: mockKnowledgeBaseArticles,
        rooms: mockRooms,
        roomBookings: mockRoomBookings,

        // Actions
        setView: (view) => set({ view }),
        setSelectedPatientId: (id) => set({ selectedPatientId: id, view: id ? get().view : 'patients' }), // Go to patient view on select
        setDrawerOpen: (open) => set({ drawerOpen: open }),
        closeSnackbar: () => set(state => ({ snackbar: { ...state.snackbar, open: false } })),
        setUserMenuAnchor: (anchor) => set({ userMenuAnchor: anchor }),
        setIsImporting: (importing) => set({ isImporting: importing }),

        savePatient: (updatedPatient: Patient, user: Profile) => {
            if (!user) return;
            const patients = get().patients;

            let patientToSave = {...updatedPatient};
            const oldPatient = patients.find(p => p.id === patientToSave.id);
            if(oldPatient) {
                const newRateEntry = patientToSave.rateHistory.find(r => r.startDate === 'proxy');
                if(newRateEntry) {
                    patientToSave.rateHistory = oldPatient.rateHistory.filter(r => r.startDate !== 'proxy');
                    const latestRate = patientToSave.rateHistory.sort((a,b) => moment(b.startDate).diff(a.startDate))[0];

                    if(!latestRate || latestRate.rate !== newRateEntry.rate) {
                        patientToSave.rateHistory.push({
                            startDate: new Date().toISOString().split('T')[0],
                            rate: newRateEntry.rate,
                            ...auditInfo(user)
                        });
                        logAction(user, 'rate-change', `תעריף שונה ל-₪${newRateEntry.rate}`, patientToSave.id);
                    }
                }

                if(oldPatient.status !== patientToSave.status) {
                    patientToSave.statusHistory = [...(oldPatient.statusHistory || []), {
                        date: new Date().toISOString().split('T')[0],
                        status: patientToSave.status,
                        changedBy: user.full_name
                    }];
                    logAction(user, 'status-change', `סטטוס שונה ל: ${patientToSave.status}`, patientToSave.id);
                }
            }

            const updatedData = { ...patientToSave, ...auditInfo(user), updatedAt: new Date().toISOString(), updatedBy: user.full_name };
            
            set(state => ({
                patients: state.patients.map(p => p.id === updatedData.id ? updatedData : p),
                snackbar: { open: true, message: 'פרטי מטופל נשמרו בהצלחה', severity: 'success' }
            }));
        },

        addPatient: (patientData: Omit<Patient, 'transactions' | 'clinicalNotes'| 'discounts' | 'history' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'rateHistory' | 'statusHistory' | 'relationships'> & {initialRate: number}, user: Profile) => {
            const { patients } = get();
            if (!user) return;
            if (patients.some(p => p.id === patientData.id)) {
                set({ snackbar: { open: true, message: 'מטופל עם ת.ז. זו כבר קיים', severity: 'error' } });
                return;
            }
            const newPatient: Patient = {
                ...patientData,
                transactions: [],
                clinicalNotes: [],
                discounts: [],
                relationships: [],
                history: [],
                rateHistory: [{
                    startDate: patientData.referralDate,
                    rate: patientData.initialRate,
                    ...auditInfo(user)
                }],
                statusHistory: [{
                    date: patientData.referralDate,
                    status: patientData.status,
                    changedBy: user.full_name,
                }],
                ...auditInfo(user),
            };
            set(state => ({
                patients: [newPatient, ...state.patients],
                snackbar: { open: true, message: 'מטופל חדש נוסף בהצלחה', severity: 'success' }
            }));
        },

        importPatients: (importedPatients: Patient[]) => {
            const { patients } = get();
            const newPatients = importedPatients.filter(imp => !patients.some(p => p.id === imp.id));
            const updatedPatients = patients.map(p => {
                const updated = importedPatients.find(imp => imp.id === p.id);
                return updated ? { ...p, ...updated } : p;
            });
            
            set({
                patients: [...updatedPatients, ...newPatients],
                isImporting: false,
                snackbar: { open: true, message: `יובאו ${newPatients.length} מטופלים חדשים ועודכנו ${importedPatients.length - newPatients.length} קיימים.`, severity: 'success' }
            });
        },
        
        saveAppointment: (app: Omit<Appointment, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>, user: Profile) => {
            if(!user) return;

            set(state => {
                const existing = state.appointments.find(a => a.id === app.id);
                const updatedAppointments = existing 
                    ? state.appointments.map(a => a.id === app.id ? {...a, ...app, ...auditInfo(user)} as Appointment : a)
                    : [...state.appointments, {...app, ...auditInfo(user)} as Appointment];
                
                return {
                    appointments: updatedAppointments,
                    snackbar: { open: true, message: 'הפגישה נשמרה בהצלחה', severity: 'success' }
                };
            });
        },
        
        deleteAppointment: (appointmentId: string) => {
            set(state => ({
                appointments: state.appointments.filter(a => a.id !== appointmentId),
                snackbar: { open: true, message: 'הפגישה נמחקה', severity: 'warning' }
            }));
        },

        checkIn: (appointmentId: string, checkedIn: boolean) => {
            set(state => ({
                appointments: state.appointments.map(app => app.id === appointmentId ? {...app, checkedIn} : app)
            }));
        },

        addTransaction: (patientId: string, transactionData: Omit<Payment | OneTimeCharge | Refund, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>, user: Profile) => {
            if(!user) return;

            const transaction = {
                ...transactionData,
                id: `trans_${Date.now()}`,
                ...auditInfo(user),
            } as Payment | OneTimeCharge | Refund;

            set(state => ({
                patients: state.patients.map(p => 
                    p.id === patientId ? {...p, transactions: [...p.transactions, transaction]} : p
                )
            }));
            logAction(user, 'transaction-add', `נוספה תנועה מסוג ${transaction.type} בסך ₪${transaction.amount}`, patientId);
            set({ snackbar: { open: true, message: 'התנועה נרשמה בהצלחה', severity: 'success' } });
        },

        addClinicalNote: (patientId: string, content: string, user: Profile) => {
            if(!user) return;
            const now = new Date().toISOString();
            const noteToAdd: ClinicalNote = {
                id: `note_${Date.now()}`,
                date: now,
                author: user.full_name,
                content: content,
                ...auditInfo(user)
            };
            set(state => ({
                patients: state.patients.map(p => 
                    p.id === patientId ? {...p, clinicalNotes: [noteToAdd, ...p.clinicalNotes]} : p
                )
            }));
        },

        requestDiscount: (patientId: string, discountRequest: Omit<Discount, 'id'|'status'|'requester'|'createdAt'|'createdBy'|'updatedAt'|'updatedBy'| 'approver' | 'decisionDate' | 'notes'>, user: Profile) => {
            if(!user) return;
            const newDiscount: Discount = {
                ...discountRequest,
                id: `disc_${Date.now()}`,
                status: 'ממתין לאישור',
                requester: user.full_name,
                ...auditInfo(user)
            };
            set(state => ({
                patients: state.patients.map(p => 
                    p.id === patientId ? {...p, discounts: [...(p.discounts || []), newDiscount]} : p
                )
            }));
            logAction(user, 'discount-request', `הוגשה בקשת הנחה: ${newDiscount.type === 'percentage' ? newDiscount.value+'%' : '₪'+newDiscount.value}`, patientId);
            set({ snackbar: { open: true, message: 'בקשת הנחה הוגשה לאישור', severity: 'info' } });
        },

        updateDiscountStatus: (patientId: string, discountId: string, status: 'מאושר' | 'נדחה', user: Profile) => {
            if (!user) return;
            set(state => ({
                patients: state.patients.map(p => {
                    if (p.id === patientId) {
                        const updatedDiscounts = p.discounts.map(d => 
                            d.id === discountId 
                            ? { ...d, status, approver: user.full_name, decisionDate: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString(), updatedBy: user.full_name } 
                            : d
                        );
                        return { ...p, discounts: updatedDiscounts };
                    }
                    return p;
                }),
                snackbar: {open: true, message: `הבקשה ${status === 'מאושר' ? 'אושרה' : 'נדחתה'}`, severity: status === 'מאושר' ? 'success' : 'warning'}
            }));
            logAction(user, 'discount-decision', `סטטוס הנחה עודכן ל: ${status}`, patientId);
        },

        setSplitBilling: (patientId: string, splitWithId: string, percentage: number, user: Profile) => {
            if(!user) return;
            set(state => ({
                patients: state.patients.map(p => 
                    p.id === patientId 
                    ? { ...p, billingInfo: {splitWithPatientId: splitWithId, splitPercentage: percentage}, updatedAt: new Date().toISOString(), updatedBy: user.full_name }
                    : p
                ),
                snackbar: {open: true, message: 'פיצול החיוב עודכן', severity: 'success'}
            }));
            logAction(user, 'billing-split-update', `הוגדר פיצול חיוב עם ת.ז. ${splitWithId}, ${percentage}% למשלם הראשי`, patientId);
        },

        removeSplitBilling: (patientId: string, user: Profile) => {
            if(!user) return;
            set(state => ({
                patients: state.patients.map(p => {
                    if(p.id === patientId) {
                        const { billingInfo, ...rest } = p;
                        return { ...rest, updatedAt: new Date().toISOString(), updatedBy: user.full_name };
                    }
                    return p;
                }),
                snackbar: {open: true, message: 'פיצול החיוב בוטל', severity: 'info'}
            }));
            logAction(user, 'billing-split-update', `בוטל פיצול חיוב`, patientId);
        },

        addRelationship: (patientId: string, relationship: Relationship, user: Profile) => {
             const { patients } = get();
             if(!user) return;
             
             const addRel = (p: Patient, rel: Relationship) => ({ ...p, relationships: [...p.relationships, rel] });
             const relatedPatient = patients.find(p => p.id === relationship.relatedPatientId);
             if (!relatedPatient) return;

             set(state => ({
                 patients: state.patients.map(p => {
                     if (p.id === patientId) return addRel(p, relationship);
                     if (p.id === relationship.relatedPatientId) return addRel(p, { relatedPatientId: patientId, relationshipType: relationship.relationshipType });
                     return p;
                 }),
                 snackbar: {open: true, message: 'הקשר נוסף בהצלחה', severity: 'success'}
             }));
             logAction(user, 'relationship-change', `נוצר קשר עם ${relatedPatient.firstName} ${relatedPatient.lastName}`, patientId);
        },

        removeRelationship: (patientId: string, relatedPatientId: string, user: Profile) => {
            if(!user) return;
            
            const removeRel = (p: Patient, relId: string) => ({...p, relationships: p.relationships.filter(r => r.relatedPatientId !== relId)});
            
            set(state => ({
                patients: state.patients.map(p => {
                    if (p.id === patientId) return removeRel(p, relatedPatientId);
                    if (p.id === relatedPatientId) return removeRel(p, patientId);
                    return p;
                }),
                snackbar: {open: true, message: 'הקשר הוסר', severity: 'info'}
            }));
            logAction(user, 'relationship-change', `הוסר קשר עם ת.ז. ${relatedPatientId}`, patientId);
        },

        updateUserRole: (_userId: string, _newRole: Role) => {
            set(() => ({
                // This will be handled by Supabase logic, placeholder for now
                snackbar: { open: true, message: 'יש לנהל הרשאות דרך Supabase', severity: 'info'}
            }));
        },

        addUser: (_userData: { name: string, role: Role }) => {
            set({ snackbar: { open: true, message: 'יש להוסיף משתמשים דרך Supabase', severity: 'info'} });
        },

        addTherapist: (therapistData: Omit<Therapist, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>, user: Profile) => {
            if (!user) return;
            const newTherapist: Therapist = {
                id: `therapist_${Date.now()}`,
                ...therapistData,
                ...auditInfo(user)
            };
            set(state => ({
                therapists: [...state.therapists, newTherapist],
                snackbar: { open: true, message: 'מטפל/ת חדש/ה נוסף/ה למערכת', severity: 'success'}
            }));
        },

        submitReferral: (referralData: Partial<Patient>) => {
            const newPatient: Patient = {
                ...referralData,
                transactions: [], clinicalNotes: [], discounts: [], relationships: [], history: [],
                therapist: 'טרם שויך',
                treatmentType: 'לא צוין',
                referralDate: new Date().toISOString().split('T')[0],
                status: 'בהמתנה לטיפול',
                paymentTier: 1,
                paymentCommittee: false,
                rateHistory: [],
                statusHistory: [{date: new Date().toISOString().split('T')[0], status: 'בהמתנה לטיפול', changedBy: 'הפנייה ציבורית'}],
                // Since this is a public referral, we can't use auditInfo with a real user
                createdAt: new Date().toISOString(),
                createdBy: 'הפנייה ציבורית',
                updatedAt: new Date().toISOString(),
                updatedBy: 'הפנייה ציבורית',
            } as Patient;
            set(state => ({
                patients: [newPatient, ...state.patients],
                snackbar: { open: true, message: 'הפנייה נשלחה בהצלחה! ניצור קשר בהקדם.', severity: 'success' },
                view: 'login'
            }));
        },

        addRoom: (roomData: Omit<Room, 'id'>) => {
             set(state => ({
                rooms: [...state.rooms, { id: `room_${Date.now()}`, ...roomData }],
                snackbar: { open: true, message: 'חדר חדש נוסף למערכת', severity: 'success'}
            }));
        },

        saveRoomBooking: (booking: Omit<RoomBooking, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { id?: string }, user: Profile) => {
            if(!user) return;
            
            set(state => {
                const updatedBookings = booking.id
                    ? state.roomBookings.map(b => b.id === booking.id ? { ...b, ...booking, ...auditInfo(user) } as RoomBooking : b)
                    : [...state.roomBookings, { id: `rb_${Date.now()}`, ...booking, ...auditInfo(user) } as RoomBooking];

                return {
                    roomBookings: updatedBookings,
                    snackbar: { open: true, message: 'השיבוץ נשמר בהצלחה', severity: 'success' }
                };
            });
        },
        
        deleteRoomBooking: (booking: Pick<RoomBooking, 'date' | 'startTime' | 'roomId'>) => {
            set(state => ({
                roomBookings: state.roomBookings.filter(b => !(b.date === booking.date && b.startTime === booking.startTime && b.roomId === booking.roomId)),
                snackbar: { open: true, message: 'השיבוץ בוטל', severity: 'info' }
            }));
        },
    };
});