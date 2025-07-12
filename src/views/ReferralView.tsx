/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
    Container, Paper, Typography, Box, TextField, Button, MenuItem, Alert
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Patient, TherapeuticCenter } from '../types';
import { isValidIsraeliID } from '../utils/validation';
import { useClinicStore } from '../store';

type ReferralFormData = Omit<Patient, 'transactions' | 'clinicalNotes' | 'discounts' | 'therapist' | 'treatmentType' | 'paymentTier' | 'paymentCommittee' | 'startDate' | 'endDate' | 'status' | 'referralDate' | 'notes' | 'history' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'statusHistory' | 'relationships'>;

const therapeuticCenters: TherapeuticCenter[] = ['מרכז למשפחה', 'טיפול באלימות', 'מרכז להורות'];

const getInitialState = (): ReferralFormData & { reasonForReferral: string } => ({
    id: '',
    idNumber: '',
    firstName: '',
    lastName: '',
    address: '',
    birthDate: '',
    gender: 'אחר',
    phone: '',
    email: '',
    therapeuticCenter: 'מרכז למשפחה',
    reasonForReferral: '',
    referringEntity: 'עצמי',
    rateHistory: [],
});

export const ReferralView: React.FC = () => {
    const { submitReferral, setView } = useClinicStore();
    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'שם פרטי הוא שדה חובה';
        if (!formData.lastName.trim()) newErrors.lastName = 'שם משפחה הוא שדה חובה';
        if (!formData.id.trim()) {
             newErrors.id = 'ת.ז. הוא שדה חובה';
        } else if (!isValidIsraeliID(formData.id)) {
            newErrors.id = 'ת.ז. אינה תקינה';
        }
        if (!formData.phone.trim()) newErrors.phone = 'טלפון הוא שדה חובה';
        if (!formData.reasonForReferral.trim()) newErrors.reasonForReferral = 'סיבת הפנייה היא שדה חובה';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value, ...(name === 'id' && { idNumber: value }) }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (validate()) {
            submitReferral(formData);
        }
    };

    return (
        <Container component="main" maxWidth="lg" sx={{ my: 4 }}>
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid var(--border-color)' }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    טופס הפניה לטיפול
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                    נא למלא את כל הפרטים. פנייתכם תועבר לגורם המתאים במרכז ותטופל בהקדם האפשרי.
                </Typography>
                
                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid xs={12} sm={6}><TextField name="firstName" label="שם פרטי" value={formData.firstName} onChange={handleChange} required fullWidth error={!!errors.firstName} helperText={errors.firstName} /></Grid>
                        <Grid xs={12} sm={6}><TextField name="lastName" label="שם משפחה" value={formData.lastName} onChange={handleChange} required fullWidth error={!!errors.lastName} helperText={errors.lastName} /></Grid>
                        <Grid xs={12} sm={6}><TextField name="id" label="ת.ז." value={formData.id} onChange={handleChange} required fullWidth error={!!errors.id} helperText={errors.id} /></Grid>
                        <Grid xs={12} sm={6}><TextField name="phone" label="טלפון ליצירת קשר" value={formData.phone} onChange={handleChange} required fullWidth error={!!errors.phone} helperText={errors.phone} /></Grid>
                        <Grid xs={12} sm={6}><TextField name="email" label="כתובת מייל" type="email" value={formData.email} onChange={handleChange} fullWidth /></Grid>
                        <Grid xs={12} sm={6}><TextField name="address" label="כתובת מגורים" value={formData.address} onChange={handleChange} fullWidth /></Grid>
                        <Grid xs={12} sm={6}><TextField name="birthDate" label="תאריך לידה" type="date" value={formData.birthDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                        <Grid xs={12} sm={6}>
                            <TextField select name="gender" label="מגדר" value={formData.gender} onChange={handleChange} fullWidth>
                                <MenuItem value="זכר">זכר</MenuItem>
                                <MenuItem value="נקבה">נקבה</MenuItem>
                                <MenuItem value="אחר">אחר</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid xs={12}>
                             <TextField select label="לאיזה מרכז הפנייה מיועדת?" name="therapeuticCenter" value={formData.therapeuticCenter} onChange={handleChange} required fullWidth>
                                {therapeuticCenters.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                             </TextField>
                        </Grid>
                         <Grid xs={12}>
                            <TextField
                                name="reasonForReferral"
                                label="סיבת הפנייה (תיאור קצר)"
                                multiline
                                rows={5}
                                value={formData.reasonForReferral}
                                onChange={handleChange}
                                required
                                fullWidth
                                error={!!errors.reasonForReferral}
                                helperText={errors.reasonForReferral}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button variant="text" onClick={() => setView('login')}>
                            חזרה למסך הכניסה
                        </Button>
                        <Button type="submit" variant="contained" size="large">
                            שלח פנייה
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};