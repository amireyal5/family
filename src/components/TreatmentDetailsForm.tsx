/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    MenuItem,
    Box,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Divider,
    FormControlLabel,
    Checkbox,
    Typography
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Patient, TherapeuticCenter, PatientStatus } from '../types';
import moment from 'moment';
import { getCurrentRate } from '../utils/financials';
import { useClinicStore } from '../store';
import { useUser } from '../context/UserContext';


interface TreatmentDetailsFormProps {
    patient: Patient;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'לא זמין';
    return moment(dateString).format('DD/MM/YYYY, HH:mm');
}

export const TreatmentDetailsForm: React.FC<TreatmentDetailsFormProps> = ({ patient }) => {
    const { therapists, savePatient } = useClinicStore();
    const userProfile = useUser();
    const [formData, setFormData] = useState<Patient>(patient);
    // Local state for the rate input field
    const [rateInput, setRateInput] = useState<number>(0);

    useEffect(() => {
        setFormData(patient);
        // Initialize rate input with the current rate
        const currentRate = getCurrentRate(patient)?.rate ?? 0;
        setRateInput(currentRate);
    }, [patient]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRateInput(Number(event.target.value));
    }

    const handleSave = () => {
        if (!userProfile) return;
        const updatedPatient = { ...formData };
        
        // This is a proxy for changing the rate.
        // The actual logic of adding to rateHistory is in the store.
        // We just need to make sure the latest rate is available in the object.
        const currentRateInState = getCurrentRate(patient)?.rate ?? 0;
        if(rateInput !== currentRateInState) {
            updatedPatient.rateHistory = [...updatedPatient.rateHistory, {
                // This is a temporary entry. The store will replace it with a proper one.
                startDate: 'proxy', rate: rateInput, createdAt: '', createdBy: ''
            }]
        }

        savePatient(updatedPatient, userProfile);
    };

    const canEditFinancials = userProfile?.role === 'מנהל/ת' || userProfile?.role === 'תחשיבנית';

    const treatmentTypes = ['טיפול משפחתי', 'טיפול זוגי', 'טיפול פרטני', 'הדרכת הורים', 'טיפול באלימות במשפחה', 'טיפול בשכול', 'טיפול בטראומה', 'טיפול CBT', 'טיפול דינמי', 'ייעוץ', 'אבחון', 'קבוצת תמיכה', 'סדנה'];
    const referringEntities = ['עצמי', 'עו"ס', 'משטרה', 'משרד הרווחה', 'קופת חולים', 'בית ספר', 'גורם פרטי', 'אחר'];
    const paymentTiers = Array.from({ length: 12 }, (_, i) => i + 1);
    const statuses: PatientStatus[] = ['בטיפול', 'בהמתנה לטיפול', 'הופסק', 'הסתיים בהצלחה', 'סיום טיפול', 'מוקפא'];
    const therapeuticCenters: TherapeuticCenter[] = ['מרכז למשפחה', 'טיפול באלימות', 'מרכז להורות', 'לא שויך'];


    return (
        <Card>
            <CardHeader title="פרטי טיפול במרכז" subheader="ניהול ההיבטים הלוגיסטיים והפיננסיים של הטיפול" />
            <Divider />
            <CardContent>
                <Grid container spacing={3}>
                     <Grid md={6} xs={12}>
                        <TextField select label="מרכז טיפולי" name="therapeuticCenter" value={formData.therapeuticCenter} onChange={handleChange} fullWidth required>
                           {therapeuticCenters.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField select label="מטפל/ת אחראי/ת" name="therapist" value={formData.therapist} onChange={handleChange} fullWidth>
                           {therapists.map(t => <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField select label="סוג טיפול" name="treatmentType" value={formData.treatmentType} onChange={handleChange} fullWidth>
                           {treatmentTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField select label="סטטוס טיפול" name="status" value={formData.status} onChange={handleChange} fullWidth required>
                           {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField name="startDate" label="תאריך תחילת טיפול" type="date" value={formData.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField name="endDate" label="תאריך סיום טיפול" type="date" value={formData.endDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField select label="גורם מפנה" name="referringEntity" value={formData.referringEntity || ''} onChange={handleChange} fullWidth>
                           {referringEntities.map(re => <MenuItem key={re} value={re}>{re}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid md={6} xs={12}>
                         <FormControlLabel
                            control={<Checkbox checked={formData.paymentCommittee || false} onChange={handleChange} name="paymentCommittee" disabled={!canEditFinancials} />}
                            label="הועדת תשלום (הטיפול בסבסוד)"
                        />
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField 
                            name="monthlyRate" 
                            label="תעריף חודשי נוכחי" 
                            type="number" 
                            value={rateInput} 
                            onChange={handleRateChange} 
                            InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>₪</Box> }} 
                            fullWidth required 
                            disabled={!canEditFinancials}
                            helperText={!canEditFinancials ? "נדרשת הרשאת תחשיבנית או מנהל" : "שינוי ערך זה ייצור רשומת תעריף חדשה."}
                        />
                    </Grid>
                     <Grid md={6} xs={12}>
                        <TextField 
                            select 
                            label="דרגת תשלום" 
                            name="paymentTier" 
                            value={formData.paymentTier} 
                            onChange={handleChange} 
                            fullWidth 
                            required 
                            disabled={!canEditFinancials}
                            helperText={!canEditFinancials ? "נדרשת הרשאת תחשיבנית או מנהל" : ""}
                        >
                           {paymentTiers.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'space-between', p: 2, bgcolor: 'action.hover' }}>
                <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                        נוצר ב: {formatDate(patient.createdAt)} ע"י: {patient.createdBy}
                    </Typography>
                     <Typography variant="caption" display="block" color="text.secondary">
                        עודכן לאחרונה: {formatDate(patient.updatedAt)} ע"י: {patient.updatedBy}
                    </Typography>
                </Box>
                <Button onClick={handleSave} variant="contained">שמור שינויים</Button>
            </CardActions>
        </Card>
    );
};