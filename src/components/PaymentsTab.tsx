/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CardHeader, Divider, Avatar, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Stack
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import AddCardIcon from '@mui/icons-material/AddCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PaidIcon from '@mui/icons-material/Paid';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PostAddIcon from '@mui/icons-material/PostAdd';
import UndoIcon from '@mui/icons-material/Undo';
import { Patient, Transaction, Payment, OneTimeCharge, Refund } from '../types';
import { PaymentForm } from './PaymentForm';
import moment from 'moment';
import { calculatePatientFinancials } from '../utils/financials';
import { useClinicStore } from '../store';
import { useUser } from '../context/UserContext';

interface PaymentsTabProps {
    patient: Patient;
}


interface SummaryCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color = 'text.primary' }) => (
    <Card sx={{ height: '100%', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
        <CardContent>
            <Grid container spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Grid>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                        {title}
                    </Typography>
                    <Typography color={color} variant="h5" sx={{fontWeight: 600}}>
                        {value}
                    </Typography>
                </Grid>
                <Grid>
                    <Avatar sx={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', height: 56, width: 56 }}>
                        {icon}
                    </Avatar>
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);

const getTransactionChip = (type: Transaction['type']) => {
    switch (type) {
        case 'payment':
            return <Chip label="תשלום" color="success" size="small" variant="outlined" />;
        case 'charge':
            return <Chip label="חיוב" color="warning" size="small" variant="outlined" />;
        case 'refund':
            return <Chip label="זיכוי" color="info" size="small" variant="outlined" />;
        default:
            return <Chip label={type} size="small" variant="outlined" />;
    }
};

export const PaymentsTab: React.FC<PaymentsTabProps> = ({ patient }) => {
    const userProfile = useUser();
    const { patients, addTransaction } = useClinicStore();
    const [isPaymentFormOpen, setPaymentFormOpen] = React.useState(false);
    const [isChargeFormOpen, setChargeFormOpen] = React.useState(false);
    const [isRefundFormOpen, setRefundFormOpen] = React.useState(false);

    const [chargeData, setChargeData] = React.useState({description: '', amount: ''});
    const [refundData, setRefundData] = React.useState({reason: '', amount: ''});


    const { totalCharged, totalPaid, balance } = calculatePatientFinancials(patient, patients);

    const handleSavePayment = (paymentData: Omit<Payment, 'id'| 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
        if (!userProfile) return;
        addTransaction(patient.id, paymentData, userProfile);
        setPaymentFormOpen(false);
    }
    
    const handleSaveCharge = () => {
        if (!userProfile) return;
        if (!chargeData.description || !chargeData.amount || Number(chargeData.amount) <= 0) {
            alert("יש למלא תיאור וסכום חיובי.");
            return;
        }
        const newCharge: Omit<OneTimeCharge, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> = {
            type: 'charge',
            date: new Date().toISOString().split('T')[0],
            amount: Number(chargeData.amount),
            description: chargeData.description,
            issuedBy: userProfile.full_name,
        };
        addTransaction(patient.id, newCharge, userProfile);
        setChargeFormOpen(false);
        setChargeData({description: '', amount: ''});
    }

    const handleSaveRefund = () => {
        if (!userProfile) return;
        if (!refundData.reason || !refundData.amount || Number(refundData.amount) <= 0) {
            alert("יש למלא סיבה וסכום חיובי.");
            return;
        }
        const newRefund: Omit<Refund, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> = {
            type: 'refund',
            date: new Date().toISOString().split('T')[0],
            amount: Number(refundData.amount),
            reason: refundData.reason,
            processedBy: userProfile.full_name,
        };
        addTransaction(patient.id, newRefund, userProfile);
        setRefundFormOpen(false);
        setRefundData({reason: '', amount: ''});
    }

    const formatCurrency = (amount: number) => `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const sortedTransactions = [...patient.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Grid container spacing={3}>
            <Grid lg={3} md={6} xs={12}>
                 <SummaryCard 
                    title="יתרת חוב"
                    value={formatCurrency(balance)}
                    icon={<AccountBalanceWalletIcon />}
                    color={balance >= 0 ? 'success.main' : 'error.main'}
                />
            </Grid>
            <Grid lg={3} md={6} xs={12}>
                <SummaryCard 
                    title="סה''כ חויב"
                    value={formatCurrency(totalCharged)}
                    icon={<RequestQuoteIcon />}
                />
            </Grid>
             <Grid lg={3} md={6} xs={12}>
                <SummaryCard 
                    title="סה''כ שולם"
                    value={formatCurrency(totalPaid)}
                    icon={<PaidIcon />}
                />
            </Grid>
             <Grid lg={3} md={6} xs={12}>
                 <SummaryCard 
                    title="תחילת טיפול"
                    value={patient.startDate ? moment(patient.startDate).format('DD/MM/YYYY') : '-'}
                    icon={<EventAvailableIcon />}
                />
            </Grid>

             <Grid xs={12} sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                 <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" color="warning" startIcon={<PostAddIcon />} onClick={() => setChargeFormOpen(true)}>הוסף חיוב חד פעמי</Button>
                    <Button variant="outlined" color="info" startIcon={<UndoIcon />} onClick={() => setRefundFormOpen(true)}>הנפק זיכוי</Button>
                    <Button variant="contained" startIcon={<AddCardIcon />} onClick={() => setPaymentFormOpen(true)}>הזנת תשלום</Button>
                </Stack>
             </Grid>

            <Grid xs={12}>
                 <Card>
                    <CardHeader title="היסטוריית תנועות כספיות" />
                    <Divider />
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>תאריך</TableCell>
                                    <TableCell>סוג</TableCell>
                                    <TableCell>פירוט</TableCell>
                                    <TableCell align="right">חיוב</TableCell>
                                    <TableCell align="right">זכות</TableCell>
                                    <TableCell>נקלט ע"י</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedTransactions.length > 0 ? sortedTransactions.map((t) => (
                                    <TableRow hover key={t.id}>
                                        <TableCell>{moment(t.date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{getTransactionChip(t.type)}</TableCell>
                                        <TableCell>
                                            {t.type === 'payment' && `תשלום עבור ${t.forMonths} (${t.method})`}
                                            {t.type === 'charge' && t.description}
                                            {t.type === 'refund' && `זיכוי: ${t.reason}`}
                                        </TableCell>
                                        <TableCell align="right" sx={{color: 'error.main', fontWeight: 500}}>
                                            {t.type === 'charge' ? formatCurrency(t.amount) : ''}
                                        </TableCell>
                                        <TableCell align="right" sx={{color: 'success.main', fontWeight: 500}}>
                                            {t.type === 'payment' ? formatCurrency(t.amount) : t.type === 'refund' ? `(${formatCurrency(t.amount)})` : ''}
                                        </TableCell>
                                        <TableCell>{t.createdBy}</TableCell>
                                    </TableRow>
                                )) : (
                                  <TableRow>
                                    <TableCell colSpan={6} align="center">
                                      לא נמצאו תנועות כספיות
                                    </TableCell>
                                  </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Grid>
            
            <PaymentForm 
                open={isPaymentFormOpen}
                onClose={() => setPaymentFormOpen(false)}
                onSave={handleSavePayment}
            />

            {/* Charge Dialog */}
             <Dialog open={isChargeFormOpen} onClose={() => setChargeFormOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>הוספת חיוב חד פעמי</DialogTitle>
                <DialogContent>
                    <Box component="form" noValidate sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid xs={12}><TextField label="תיאור החיוב" value={chargeData.description} onChange={(e) => setChargeData({...chargeData, description: e.target.value})} fullWidth required /></Grid>
                            <Grid xs={12}><TextField label="סכום" type="number" value={chargeData.amount} onChange={(e) => setChargeData({...chargeData, amount: e.target.value})} fullWidth required InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>₪</Box> }} /></Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: '16px 24px'}}><Button onClick={() => setChargeFormOpen(false)}>ביטול</Button><Button onClick={handleSaveCharge} variant="contained">הוסף חיוב</Button></DialogActions>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={isRefundFormOpen} onClose={() => setRefundFormOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>הנפקת זיכוי</DialogTitle>
                <DialogContent>
                     <Box component="form" noValidate sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid xs={12}><TextField label="סיבת הזיכוי" value={refundData.reason} onChange={(e) => setRefundData({...refundData, reason: e.target.value})} fullWidth required /></Grid>
                            <Grid xs={12}><TextField label="סכום הזיכוי" type="number" value={refundData.amount} onChange={(e) => setRefundData({...refundData, amount: e.target.value})} fullWidth required InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>₪</Box> }} /></Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{p: '16px 24px'}}><Button onClick={() => setRefundFormOpen(false)}>ביטול</Button><Button onClick={handleSaveRefund} variant="contained">הנפק זיכוי</Button></DialogActions>
            </Dialog>
        </Grid>
    );
};