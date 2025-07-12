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
    Typography
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Patient } from '../types';
import moment from 'moment';
import { useClinicStore } from '../store';
import { useUser } from '../context/UserContext';


interface PatientFormProps {
    patient: Patient;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'לא זמין';
    return moment(dateString).format('DD/MM/YYYY, HH:mm');
}


export const PatientForm: React.FC<PatientFormProps> = ({ patient }) => {
    const userProfile = useUser();
    const savePatient = useClinicStore(state => state.savePatient);
    const [formData, setFormData] = useState<Patient>(patient);

    useEffect(() => {
        setFormData(patient);
    }, [patient]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!userProfile) {
            alert('שגיאה: לא נמצא משתמש מחובר.');
            return;
        }
        // Basic validation could be added here
        savePatient(formData, userProfile);
    };
    
    return (
        <Card>
            <CardHeader title="פרטים אישיים ופרטי קשר" subheader="עדכון פרטי המטופל" />
            <Divider />
            <CardContent>
                <Grid container spacing={3}>
                    <Grid md={6} xs={12}>
                        <TextField
                            name="firstName"
                            label="שם פרטי"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField
                            name="lastName"
                            label="שם משפחה"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid md={6} xs={12}>
                       <TextField
                            name="id"
                            label="תעודת זהות"
                            value={formData.id}
                            onChange={handleChange}
                            required
                            fullWidth
                            disabled // Cannot change ID after creation
                        />
                    </Grid>
                     <Grid md={6} xs={12}>
                        <TextField
                            name="birthDate"
                            label="תאריך לידה"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                    </Grid>
                    <Grid md={6} xs={12}>
                         <TextField
                            select
                            name="gender"
                            label="מגדר"
                            value={formData.gender}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="זכר">זכר</MenuItem>
                            <MenuItem value="נקבה">נקבה</MenuItem>
                            <MenuItem value="אחר">אחר</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField
                            name="phone"
                            label="מספר טלפון"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid md={6} xs={12}>
                        <TextField
                            name="email"
                            label="כתובת מייל"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid md={6} xs={12}>
                         <TextField
                            name="address"
                            label="כתובת מלאה"
                            value={formData.address}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid xs={12}>
                       <TextField
                            name="notes"
                            label="הערות"
                            value={formData.notes}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{justifyContent: 'space-between', p: 2, bgcolor: 'action.hover'}}>
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