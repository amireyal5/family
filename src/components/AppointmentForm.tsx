/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, IconButton, Tooltip
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteIcon from '@mui/icons-material/Delete';
import { Appointment, Patient, Therapist } from '../types';
import moment from 'moment';
import { useUser } from '../context/UserContext';

interface AppointmentFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => void;
    onDelete: (appointmentId: string) => void;
    appointment: Appointment | null;
    slot: { start: Date, end: Date } | null;
    patients: Patient[];
    therapists: Therapist[];
}

const getInitialState = (appointment: Appointment | null, slot: { start: Date, end: Date } | null) => {
    if (appointment) {
        return {
            id: appointment.id,
            patientId: appointment.patientId || '',
            therapistId: appointment.therapistId,
            start: moment(appointment.start).format('YYYY-MM-DDTHH:mm'),
            end: moment(appointment.end).format('YYYY-MM-DDTHH:mm'),
        };
    }
    if (slot) {
        return {
            id: `app_${Date.now()}`,
            patientId: '',
            therapistId: '',
            start: moment(slot.start).format('YYYY-MM-DDTHH:mm'),
            end: moment(slot.end).format('YYYY-MM-DDTHH:mm'),
        };
    }
    return { id: '', patientId: '', therapistId: '', start: '', end: '' };
};

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ open, onClose, onSave, onDelete, appointment, slot, patients, therapists }) => {
    const userProfile = useUser();
    const [formData, setFormData] = useState(getInitialState(appointment, slot));
    const isEditing = !!appointment;

    useEffect(() => {
        setFormData(getInitialState(appointment, slot));
    }, [appointment, slot, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!userProfile) {
            alert('שגיאה: לא נמצא משתמש מחובר.');
            return;
        }

        if (!formData.patientId && !formData.therapistId) {
            alert('יש לבחור מטופל או מטפל');
            return;
        }
        const patient = patients.find(p => p.id === formData.patientId);
        const therapist = therapists.find(t => t.id === formData.therapistId);
        
        const title = patient 
            ? `פגישה - ${patient.firstName} ${patient.lastName}` 
            : `אירוע - ${therapist?.name}`;


        const newAppointmentData: Omit<Appointment, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> = {
            id: formData.id,
            patientId: formData.patientId || undefined,
            therapistId: formData.therapistId,
            start: new Date(formData.start),
            end: new Date(formData.end),
            title: title,
            checkedIn: appointment?.checkedIn || false
        };
        onSave(newAppointmentData);
    };

    const handleDelete = () => {
        if(appointment) {
            onDelete(appointment.id);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                {isEditing ? 'עריכת אירוע' : 'קביעת אירוע חדש'}
                 {isEditing && (
                    <Tooltip title="מחק אירוע">
                        <span>
                            <IconButton onClick={handleDelete} color="error" aria-label="מחק אירוע">
                                <DeleteIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                 )}
            </DialogTitle>
            <DialogContent>
                <Box component="form" noValidate sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid xs={12}>
                             <TextField
                                select
                                name="patientId"
                                label="מטופל/ת (אופציונלי)"
                                value={formData.patientId}
                                onChange={handleChange}
                                fullWidth
                            >
                                 <MenuItem value="">
                                    <em>ללא מטופל (אירוע כללי)</em>
                                </MenuItem>
                                {patients.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{`${p.firstName} ${p.lastName}`}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                         <Grid xs={12}>
                             <TextField
                                select
                                name="therapistId"
                                label="מטפל/ת"
                                value={formData.therapistId}
                                onChange={handleChange}
                                required
                                fullWidth
                            >
                                {therapists.map(t => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <TextField
                                name="start"
                                label="שעת התחלה"
                                type="datetime-local"
                                value={formData.start}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <TextField
                                name="end"
                                label="שעת סיום"
                                type="datetime-local"
                                value={formData.end}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose}>ביטול</Button>
                <Button onClick={handleSave} variant="contained">שמור שינויים</Button>
            </DialogActions>
        </Dialog>
    );
};