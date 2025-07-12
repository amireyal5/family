

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Checkbox, FormControlLabel, Box, Typography, Divider
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Patient, TherapeuticCenter, Therapist, PatientStatus } from '../types';
import { isValidIsraeliID } from '../utils/validation';

interface AddPatientFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (patient: Omit<Patient, 'transactions' | 'clinicalNotes' | 'discounts' | 'history' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'rateHistory' | 'statusHistory' | 'relationships'> & {initialRate: number}) => void;
    patients: Patient[];
    therapists: Therapist[];
    therapeuticCenters: TherapeuticCenter[];
    patientStatuses: PatientStatus[];
}

const treatmentTypes = ['טיפול משפחתי', 'טיפול זוגי', 'טיפול פרטני', 'הדרכת הורים', 'טיפול באלימות במשפחה', 'טיפול בשכול', 'טיפול בטראומה', 'טיפול CBT', 'טיפול דינמי', 'ייעוץ', 'אבחון', 'קבוצת תמיכה', 'סדנה'];
const referringEntities = ['עצמי', 'עו"ס', 'משטרה', 'משרד הרווחה', 'קופת חולים', 'בית ספר', 'גורם פרטי', 'אחר'];
const paymentTiers = Array.from({ length: 12 }, (_, i) => i + 1);

type AddPatientFormData = Omit<Patient, 'transactions' | 'clinicalNotes' | 'discounts' | 'history' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'rateHistory' | 'statusHistory' | 'relationships'> & { initialRate: number };


const getInitialFormData = (): AddPatientFormData => ({
    id: '',
    idNumber: '',
    firstName: '',
    lastName: '',
    address: '',
    birthDate: '',
    gender: 'אחר',
    phone: '',
    email: '',
    notes: '',
    therapeuticCenter: 'לא שויך',
    therapist: '',
    treatmentType: '',
    referralDate: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    initialRate: 0,
    status: 'בהמתנה לטיפול',
    paymentTier: 1,
    referringEntity: 'עצמי',
    paymentCommittee: false,
});


export const AddPatientForm: React.FC<AddPatientFormProps> = ({ open, onClose, onSave, patients, therapists, therapeuticCenters, patientStatuses }) => {
    const [formData, setFormData] = useState(getInitialFormData());
    const [idError, setIdError] = useState('');

     useEffect(() => {
        if (open) {
            setFormData(getInitialFormData());
            setIdError('');
        }
    }, [open]);

    const validateAndSetId = (id: string) => {
        if (!id) {
            setIdError('');
            return;
        }
        if (patients.some(p => p.id === id)) {
            setIdError('ת.ז. זו כבר קיימת במערכת.');
        } else if (!isValidIsraeliID(id)) {
            setIdError('ת.ז. אינה תקינה.');
        } else {
            setIdError('');
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;
        const checked = (event.target as HTMLInputElement).checked;

        if (name === 'id') {
            validateAndSetId(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'initialRate' ? (value === '' ? '' : parseFloat(value)) : value)
        }));
    };

    const handleSave = () => {
        validateAndSetId(formData.id);

        if (idError || !formData.id) {
             alert('נא לתקן את שגיאות הטופס לפני השמירה.');
             return;
        }
        if (!formData.firstName || !formData.lastName) {
            alert('נא למלא שדות חובה: שם פרטי ושם משפחה.');
            return;
        }

        const newPatientData: AddPatientFormData = {
            ...formData,
            idNumber: formData.id,
            initialRate: Number(formData.initialRate),
        };
        onSave(newPatientData);
        handleClose();
    };

    const handleClose = () => {
        setFormData(getInitialFormData()); // Reset form on close
        setIdError('');
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
            <DialogTitle>הוספת מטופל חדש</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate sx={{ mt: 2 }}>
                    {/* Personal Details */}
                    <Typography variant="h6" gutterBottom>1. פרטים אישיים</Typography>
                    <Grid container spacing={2}>
                         <Grid xs={12} sm={6}><TextField name="firstName" label="שם פרטי" value={formData.firstName} onChange={handleChange} required fullWidth /></Grid>
                         <Grid xs={12} sm={6}><TextField name="lastName" label="שם משפחה" value={formData.lastName} onChange={handleChange} required fullWidth /></Grid>
                         <Grid xs={12} sm={6}>
                            <TextField 
                                name="id" 
                                label="ת.ז." 
                                value={formData.id}
                                onChange={handleChange} 
                                required 
                                fullWidth
                                error={!!idError}
                                helperText={idError}
                            />
                        </Grid>
                         <Grid xs={12} sm={6}><TextField name="birthDate" label="תאריך לידה" type="date" value={formData.birthDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                         <Grid xs={12} sm={6}><TextField select name="gender" label="מגדר" value={formData.gender} onChange={handleChange} fullWidth><MenuItem value="זכר">זכר</MenuItem><MenuItem value="נקבה">נקבה</MenuItem><MenuItem value="אחר">אחר</MenuItem></TextField></Grid>
                         <Grid xs={12} sm={6}><TextField name="phone" label="טלפון" value={formData.phone} onChange={handleChange} fullWidth /></Grid>
                         <Grid xs={12} sm={6}><TextField name="email" label="מייל" type="email" value={formData.email} onChange={handleChange} fullWidth /></Grid>
                         <Grid xs={12} sm={6}><TextField name="address" label="כתובת" value={formData.address} onChange={handleChange} fullWidth /></Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Treatment Details */}
                    <Typography variant="h6" gutterBottom>2. פרטי טיפול</Typography>
                    <Grid container spacing={2}>
                        <Grid xs={12} sm={6}><TextField select label="מרכז טיפולי" name="therapeuticCenter" value={formData.therapeuticCenter} onChange={handleChange} fullWidth required>{therapeuticCenters.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
                        <Grid xs={12} sm={6}><TextField select label="מטפל/ת" name="therapist" value={formData.therapist} onChange={handleChange} fullWidth>{therapists.map(t => <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>)}</TextField></Grid>
                        <Grid xs={12} sm={6}><TextField select label="סוג טיפול" name="treatmentType" value={formData.treatmentType} onChange={handleChange} fullWidth>{treatmentTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
                        <Grid xs={12} sm={6}><TextField select label="סטטוס" name="status" value={formData.status} onChange={handleChange} fullWidth required>{patientStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                        <Grid xs={12} sm={6}><TextField name="referralDate" label="תאריך הפנייה" type="date" value={formData.referralDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                        <Grid xs={12} sm={6}><TextField name="startDate" label="תאריך תחילת טיפול" type="date" value={formData.startDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                        <Grid xs={12} sm={6}><TextField select label="גורם מפנה" name="referringEntity" value={formData.referringEntity} onChange={handleChange} fullWidth>{referringEntities.map(re => <MenuItem key={re} value={re}>{re}</MenuItem>)}</TextField></Grid>
                    </Grid>
                    
                     <Divider sx={{ my: 3 }} />

                    {/* Financial Details */}
                    <Typography variant="h6" gutterBottom>3. פרטי תשלום</Typography>
                     <Grid container spacing={2}>
                        <Grid xs={12} sm={6}><TextField name="initialRate" label="תעריף חודשי" type="number" value={formData.initialRate} onChange={handleChange} InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>₪</Box> }} fullWidth required /></Grid>
                        <Grid xs={12} sm={6}><TextField select label="דרגת תשלום" name="paymentTier" value={formData.paymentTier} onChange={handleChange} fullWidth required>{paymentTiers.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}</TextField></Grid>
                        <Grid xs={12} sx={{display: 'flex', alignItems: 'center'}}><FormControlLabel control={<Checkbox checked={formData.paymentCommittee} onChange={handleChange} name="paymentCommittee" />} label="הועדת תשלום" /></Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose}>ביטול</Button>
                <Button onClick={handleSave} variant="contained" disabled={!!idError}>שמור והוסף מטופל</Button>
            </DialogActions>
        </Dialog>
    );
};