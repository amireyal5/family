/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert
} from '@mui/material';
import { Patient, TherapeuticCenter } from '../types';
import { isValidIsraeliID } from '../utils/validation';
import { useClinicStore } from '../store';

const validCenters: TherapeuticCenter[] = ['מרכז למשפחה', 'טיפול באלימות', 'מרכז להורות'];

export const DataImportDialog: React.FC = () => {
    const { isImporting, setIsImporting, importPatients } = useClinicStore();
    const [csvData, setCsvData] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => {
        setIsImporting(false);
        setCsvData('');
        setError('');
    }

    const handleImport = () => {
        setError('');
        if (!csvData.trim()) {
            setError("נא להדביק מידע בפורמט CSV.");
            return;
        }

        const lines = csvData.trim().split('\n').slice(1); // Remove header row
        const importedPatients: Patient[] = [];

        for (const line of lines) {
            const values = line.split(',');
            if (values.length < 6) continue; // Basic check for minimum columns

            const id = values[0]?.trim();
            if (!isValidIsraeliID(id)) {
                console.warn(`Skipping invalid ID: ${id}`);
                continue;
            }
            
            const center = values[6]?.trim();
            const therapeuticCenter: TherapeuticCenter = validCenters.includes(center as TherapeuticCenter) ? center as TherapeuticCenter : 'לא שויך';

            const patient: Patient = {
                id,
                idNumber: id,
                firstName: values[1]?.trim() || '',
                lastName: values[2]?.trim() || '',
                phone: values[3]?.trim() || '',
                email: values[4]?.trim() || '',
                therapist: values[5]?.trim() || '',
                therapeuticCenter,
                // Add default values for other required fields
                address: '',
                birthDate: '',
                gender: 'אחר',
                notes: '',
                treatmentType: 'לא צוין',
                referralDate: new Date().toISOString().split('T')[0],
                startDate: '',
                endDate: '',
                rateHistory: [],
                status: 'בהמתנה לטיפול',
                statusHistory: [],
                paymentTier: 1,
                paymentCommittee: false,
                transactions: [],
                clinicalNotes: [],
                discounts: [],
                relationships: [],
                history: [],
                createdAt: new Date().toISOString(),
                createdBy: 'Import',
                updatedAt: new Date().toISOString(),
                updatedBy: 'Import',
            };
            importedPatients.push(patient);
        }

        if (importedPatients.length === 0) {
            setError("לא נמצאו נתונים תקינים לייבוא. אנא בדוק את מבנה ה-CSV.");
            return;
        }

        importPatients(importedPatients);
        handleClose();
    };

    return (
        <Dialog open={isImporting} onClose={handleClose} fullWidth maxWidth="lg">
            <DialogTitle>ייבוא נתוני מטופלים</DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <b>הוראות:</b> יש להדביק את המידע בפורמט CSV (ערכים מופרדים בפסיק).
                        <br/>
                        השורה הראשונה חייבת להיות כותרת והעמודות חייבות להיות בסדר הבא:
                        <br/>
                        <code style={{ direction: 'ltr', display: 'block', textAlign: 'left', marginTop: '4px' }}>
                            id,firstName,lastName,phone,email,therapist,therapeuticCenter
                        </code>
                         כל שאר השדות יקבלו ערכי ברירת מחדל.
                    </Typography>
                </Alert>
                <TextField
                    label="הדבק כאן מידע CSV"
                    multiline
                    rows={15}
                    fullWidth
                    variant="outlined"
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder="id,firstName,lastName,phone,email,therapist,therapeuticCenter..."
                />
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={handleClose}>ביטול</Button>
                <Button onClick={handleImport} variant="contained">ייבא נתונים</Button>
            </DialogActions>
        </Dialog>
    );
};