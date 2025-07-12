/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, TextField, MenuItem, Card, CardHeader, CardContent, Divider, Table, TableHead, TableRow, TableCell, TableBody, Chip, TableContainer
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Patient, Discount } from '../types';
import moment from 'moment';
import { useClinicStore } from '../store';

interface FinancialManagementTabProps {
    patient: Patient;
}

const getDiscountStatusChipColor = (status: Discount['status']) => {
    switch (status) {
        case 'מאושר': return 'success';
        case 'ממתין לאישור': return 'warning';
        case 'נדחה': return 'error';
        default: return 'default';
    }
};

export const FinancialManagementTab: React.FC<FinancialManagementTabProps> = ({ patient }) => {
    const { patients, requestDiscount, setSplitBilling, removeSplitBilling } = useClinicStore();

    const [discountForm, setDiscountForm] = useState({
        type: 'fixed_amount' as 'fixed_amount' | 'percentage',
        value: '',
        reason: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: moment().add(6, 'months').toISOString().split('T')[0],
    });

    const [splitForm, setSplitForm] = useState({
        splitWithPatientId: '',
        splitPercentage: 50
    });

    useEffect(() => {
        if (patient.billingInfo) {
            setSplitForm({
                splitWithPatientId: patient.billingInfo.splitWithPatientId || '',
                splitPercentage: patient.billingInfo.splitPercentage || 50
            })
        } else {
             setSplitForm({ splitWithPatientId: '', splitPercentage: 50 });
        }
    }, [patient.billingInfo]);


    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDiscountForm({ ...discountForm, [e.target.name]: e.target.value });
    }

    const handleDiscountSubmit = () => {
        if (!discountForm.value || !discountForm.reason) {
            alert('נא למלא ערך וסיבה לבקשת ההנחה.');
            return;
        }
        requestDiscount(patient.id, {
            ...discountForm,
            value: Number(discountForm.value),
            requestDate: new Date().toISOString().split('T')[0],
        });
        setDiscountForm({ type: 'fixed_amount', value: '', reason: '', validFrom: new Date().toISOString().split('T')[0], validUntil: moment().add(6, 'months').toISOString().split('T')[0] });
    }

    const handleSplitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSplitForm({ ...splitForm, [e.target.name]: e.target.value });
    }

    const handleSplitSubmit = () => {
        if (!splitForm.splitWithPatientId) {
            alert('נא לבחור מטופל לפיצול החיוב.');
            return;
        }
        setSplitBilling(patient.id, splitForm.splitWithPatientId, Number(splitForm.splitPercentage));
    }

    const otherPatients = patients.filter(p => p.id !== patient.id);

    return (
        <Grid container spacing={3}>
            {/* Discount Management */}
            <Grid xs={12}>
                <Card>
                    <CardHeader title="ניהול הנחות" />
                    <Divider />
                    <CardContent>
                        <Typography variant="h6" gutterBottom>בקשת הנחה חדשה</Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid xs={12} sm={2}><TextField select fullWidth size="small" label="סוג הנחה" name="type" value={discountForm.type} onChange={handleDiscountChange}><MenuItem value="fixed_amount">סכום קבוע (₪)</MenuItem><MenuItem value="percentage">אחוז (%)</MenuItem></TextField></Grid>
                            <Grid xs={12} sm={2}><TextField fullWidth size="small" label="ערך" name="value" type="number" value={discountForm.value} onChange={handleDiscountChange} /></Grid>
                            <Grid xs={12} sm={2}><TextField fullWidth size="small" label="החל מתאריך" name="validFrom" type="date" value={discountForm.validFrom} onChange={handleDiscountChange} InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid xs={12} sm={2}><TextField fullWidth size="small" label="בתוקף עד" name="validUntil" type="date" value={discountForm.validUntil} onChange={handleDiscountChange} InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid xs={12} sm={3}><TextField fullWidth size="small" label="סיבה לבקשה" name="reason" value={discountForm.reason} onChange={handleDiscountChange} /></Grid>
                            <Grid xs={12} sm={1}><Button fullWidth variant="contained" onClick={handleDiscountSubmit}>בקש</Button></Grid>
                        </Grid>
                    </CardContent>
                    <Divider />
                    <CardContent>
                         <Typography variant="h6" gutterBottom>היסטוריית בקשות</Typography>
                         <TableContainer>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>תאריך בקשה</TableCell><TableCell>סוג</TableCell><TableCell>ערך</TableCell><TableCell>תוקף</TableCell><TableCell>סטטוס</TableCell><TableCell>מאשר</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {patient.discounts?.length > 0 ? patient.discounts.map(d => (
                                        <TableRow key={d.id}>
                                            <TableCell>{moment(d.requestDate).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{d.type === 'fixed_amount' ? 'סכום קבוע' : 'אחוז'}</TableCell>
                                            <TableCell>{d.type === 'fixed_amount' ? `₪${d.value}` : `${d.value}%`}</TableCell>
                                            <TableCell>{`${moment(d.validFrom).format('DD/MM/YY')} - ${moment(d.validUntil).format('DD/MM/YY')}`}</TableCell>
                                            <TableCell><Chip label={d.status} color={getDiscountStatusChipColor(d.status)} size="small" /></TableCell>
                                            <TableCell>{d.approver || '-'}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={6} align="center">לא קיימות בקשות להנחה</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                         </TableContainer>
                    </CardContent>
                </Card>
            </Grid>

             {/* Split Billing Management */}
            <Grid xs={12}>
                 <Card>
                    <CardHeader title="פיצול חיוב" subheader="חלק את החיוב עבור טיפול זה עם מטופל אחר" />
                    <Divider />
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid xs={12} sm={5}>
                                <TextField 
                                    select
                                    fullWidth
                                    size="small"
                                    label="פיצול עם"
                                    name="splitWithPatientId"
                                    value={splitForm.splitWithPatientId}
                                    onChange={handleSplitChange}
                                    helperText={patient.billingInfo?.splitWithPatientId ? `החיוב הנוכחי מפוצל. כדי לשנות, בחר מטופל אחר ולחץ 'עדכן'.` : ''}
                                >
                                     <MenuItem value="">
                                        <em>ללא פיצול</em>
                                    </MenuItem>
                                    {otherPatients.map(p => <MenuItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</MenuItem>)}
                                </TextField>
                            </Grid>
                             <Grid xs={12} sm={5}>
                                <TextField 
                                    fullWidth
                                    size="small"
                                    label={`אחוז חיוב עבור ${patient.firstName} (%)`}
                                    name="splitPercentage"
                                    type="number"
                                    value={splitForm.splitPercentage}
                                    onChange={handleSplitChange}
                                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                                    helperText="הצד השני יחויב ביתרה"
                                />
                            </Grid>
                            <Grid xs={12} sm={2}>
                                {patient.billingInfo?.splitWithPatientId ? (
                                    <Box sx={{display: 'flex', gap: 1}}>
                                        <Button fullWidth variant="contained" onClick={handleSplitSubmit}>עדכן</Button>
                                        <Button fullWidth variant="outlined" color="error" onClick={() => removeSplitBilling(patient.id)}>בטל</Button>
                                    </Box>
                                ) : (
                                    <Button fullWidth variant="contained" onClick={handleSplitSubmit} disabled={!splitForm.splitWithPatientId}>הגדר</Button>
                                )}
                            </Grid>
                        </Grid>
                         <Typography variant="caption" color="textSecondary" sx={{mt: 2, display: 'block'}}>
                            <b>הערה:</b> הגדרת פיצול כאן תחייב את המטופל הנבחר בחלק היחסי של החיוב עבור טיפול זה. החישוב יבוצע על בסיס התעריף של {patient.firstName} {patient.lastName}.
                         </Typography>
                    </CardContent>
                 </Card>
            </Grid>
        </Grid>
    );
};