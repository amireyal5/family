/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CardHeader,
    Divider
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import moment from 'moment';
import { calculatePatientFinancials } from '../utils/financials';
import { useClinicStore } from '../store';


interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2.5, height: '100%' }}>
        <Box sx={{
            mr: 2,
            p: 2,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color,
            color: '#fff'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{fontWeight: 600}}>{title}</Typography>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
        </Box>
    </Card>
);

export const PaymentsView: React.FC = () => {
    const { patients, setSelectedPatientId } = useClinicStore();
    
    const allFinancials = patients.map(p => {
        const { totalCharged, totalPaid, balance } = calculatePatientFinancials(p, patients);
        return {
            ...p,
            totalCharged,
            totalPaid,
            balance
        };
    });

    const totalCharged = allFinancials.reduce((sum, p) => sum + p.totalCharged, 0);
    const totalPaid = allFinancials.reduce((sum, p) => sum + p.totalPaid, 0);
    const totalBalance = allFinancials.reduce((sum, p) => sum + p.balance, 0);

    const patientsInDebt = allFinancials
        .filter(p => p.balance < 0)
        .sort((a,b) => a.balance - b.balance); // Sort by most debt first

    const formatCurrency = (amount: number) => `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: '700' }}>סקירה פיננסית</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                 <Grid lg={4} sm={6} xs={12}>
                    <StatCard title="סה״כ חויב" value={formatCurrency(totalCharged)} icon={<AccountBalanceWalletIcon />} color="var(--primary-color)" />
                </Grid>
                 <Grid lg={4} sm={6} xs={12}>
                    <StatCard title="סה״כ שולם" value={formatCurrency(totalPaid)} icon={<PriceCheckIcon />} color="var(--success-color)" />
                </Grid>
                 <Grid lg={4} sm={6} xs={12}>
                    <StatCard title="יתרת חוב כוללת" value={formatCurrency(totalBalance)} icon={<TrendingDownIcon />} color={totalBalance >= 0 ? "var(--success-color)" : "var(--error-color)"} />
                </Grid>
            </Grid>

            <Card>
                <CardHeader title="מטופלים בחוב" titleTypographyProps={{variant:"h6"}} />
                <Divider />
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>שם מלא</TableCell>
                                <TableCell>מטפל/ת</TableCell>
                                <TableCell>סכום חוב</TableCell>
                                <TableCell>תשלום אחרון</TableCell>
                                <TableCell>פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {patientsInDebt.length > 0 ? patientsInDebt.map(p => (
                                <TableRow hover key={p.id}>
                                    <TableCell>{`${p.firstName} ${p.lastName}`}</TableCell>
                                    <TableCell>{p.therapist}</TableCell>
                                    <TableCell>
                                        <Typography color="error.main" fontWeight="bold">
                                            {formatCurrency(p.balance)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {p.transactions && p.transactions.filter(t=>t.type==='payment').length > 0 ? moment([...p.transactions.filter(t=>t.type==='payment')].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date).format('DD/MM/YYYY') : 'לא בוצע תשלום'}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outlined" size="small" onClick={() => setSelectedPatientId(p.id)}>
                                            עבור לתיק
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">לא נמצאו מטופלים בחוב.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};