/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Payment, Profile } from '../types';
import { useUser } from '../context/UserContext';

type PaymentFormData = Omit<Payment, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

interface PaymentFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (payment: PaymentFormData, user: Profile) => void;
}

const getEmptyPayment = (userName: string): PaymentFormData => ({
    type: 'payment',
    date: new Date().toISOString().split('T')[0], // Today's date
    amount: 0,
    forMonths: '',
    method: 'כרטיס אשראי',
    collector: userName,
    notes: '',
});

export const PaymentForm: React.FC<PaymentFormProps> = ({ open, onClose, onSave }) => {
    const userProfile = useUser();
    const [formData, setFormData] = useState<PaymentFormData>(getEmptyPayment(userProfile?.full_name || ''));
    
    useEffect(() => {
        if(open && userProfile) {
            setFormData(getEmptyPayment(userProfile.full_name));
        }
    }, [open, userProfile]);


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = event.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' && value ? parseFloat(value) : value }));
    };

    const handleSave = () => {
        if (!userProfile) return;
        if (!formData.amount || formData.amount <= 0) {
            alert("יש להזין סכום תשלום חיובי.");
            return;
        }
        onSave(formData, userProfile);
        onClose();
    };
    
    const handleClose = () => {
        onClose();
    };
    
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>הזנת תשלום חדש</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid xs={12} sm={6}>
                           <TextField
                                name="date"
                                label="תאריך תשלום"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <TextField
                                name="amount"
                                label="סכום ששולם"
                                type="number"
                                value={formData.amount === 0 ? '' : formData.amount}
                                onChange={handleChange}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: <Box sx={{ mr: 1 }}>₪</Box>,
                                }}
                            />
                        </Grid>
                        <Grid xs={12}>
                           <TextField
                                name="forMonths"
                                label="שולם עבור חודשים"
                                value={formData.forMonths}
                                onChange={handleChange}
                                placeholder="לדוגמה: ינואר 2024, פברואר 2024"
                                fullWidth
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                             <TextField
                                select
                                name="method"
                                label="אמצעי תשלום"
                                value={formData.method}
                                onChange={handleChange}
                                fullWidth
                            >
                                <MenuItem value="כרטיס אשראי">כרטיס אשראי</MenuItem>
                                <MenuItem value="מזומן">מזומן</MenuItem>
                                <MenuItem value="העברה בנקאית">העברה בנקאית</MenuItem>
                                <MenuItem value="צ׳ק">צ׳ק</MenuItem>
                                <MenuItem value="ביט">ביט</MenuItem>
                                <MenuItem value="אחר">אחר</MenuItem>
                            </TextField>
                        </Grid>
                         <Grid xs={12} sm={6}>
                            <TextField
                                name="collector"
                                label="נקלט ע''י"
                                value={formData.collector}
                                fullWidth
                                disabled
                                helperText="שם המשתמש המחובר, לא ניתן לשינוי."
                            />
                        </Grid>
                        <Grid xs={12}>
                           <TextField
                                name="notes"
                                label="הערות לתשלום"
                                value={formData.notes}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{p: '16px 24px'}}>
                <Button onClick={handleClose}>ביטול</Button>
                <Button onClick={handleSave} variant="contained">שמירת תשלום</Button>
            </DialogActions>
        </Dialog>
    );
};