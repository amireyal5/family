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
    Avatar,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button
} from '@mui/material';
import { Patient, Appointment } from '../types';
import { calculatePatientFinancials, getCurrentRate } from '../utils/financials';
import moment from 'moment';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import PhoneIcon from '@mui/icons-material/Phone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import EscalatorWarningIcon from '@mui/icons-material/EscalatorWarning';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { useClinicStore } from '../store';


function getStatusChipColor(status: Patient['status']) {
    switch (status) {
        case 'בטיפול': return 'success';
        case 'בהמתנה לטיפול': return 'warning';
        case 'הסתיים בהצלחה': return 'info';
        case 'הופסק': case 'סיום טיפול': return 'default';
        default: return 'primary';
    }
}

const formatCurrency = (amount: number) => `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface PatientSummaryCardProps {
    patient: Patient;
}

export const PatientSummaryCard: React.FC<PatientSummaryCardProps> = ({ patient }) => {
    const { patients, appointments, setSelectedPatientId } = useClinicStore();

    const { balance } = calculatePatientFinancials(patient, patients);
    const currentRate = getCurrentRate(patient)?.rate ?? 0;
    
    const nextAppointment = appointments
        .filter(a => a.patientId === patient.id && moment(a.start).isAfter(moment()))
        .sort((a,b) => moment(a.start).diff(moment(b.start)))[0];

    const patientMap = new Map(patients.map(p => [p.id, `${p.firstName} ${p.lastName}`]));

    return (
        <Card sx={{ position: 'sticky', top: '88px' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ width: 80, height: 80, margin: '0 auto 16px', bgcolor: 'primary.light', color: 'primary.dark', fontSize: '2.5rem' }}>
                    {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">{patient.firstName} {patient.lastName}</Typography>
                <Typography color="text.secondary" gutterBottom>ת.ז. {patient.idNumber}</Typography>
                <Chip label={patient.status} color={getStatusChipColor(patient.status)} size="small" variant="filled" />
            </CardContent>
            <Divider />
            <List dense sx={{p: 2}}>
                 <ListItem disablePadding>
                    <ListItemIcon sx={{minWidth: 40, color: 'text.secondary'}}>
                        <AccountBalanceWalletIcon fontSize="small" color={balance >= 0 ? 'success' : 'error'} />
                    </ListItemIcon>
                    <ListItemText primary="יתרה" secondary={
                        <Typography component="span" variant="body2" color={balance >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                            {formatCurrency(balance)}
                        </Typography>
                    } />
                </ListItem>
                 <ListItem disablePadding>
                    <ListItemIcon sx={{minWidth: 40, color: 'text.secondary'}}>
                        <LocalAtmIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="תעריף נוכחי" secondary={formatCurrency(currentRate)} />
                </ListItem>
                 <ListItem disablePadding>
                    <ListItemIcon sx={{minWidth: 40, color: 'text.secondary'}}>
                        <EventIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="פגישה קרובה" secondary={nextAppointment ? moment(nextAppointment.start).format('DD/MM/YY HH:mm') : 'אין'} />
                </ListItem>
                 <ListItem disablePadding>
                    <ListItemIcon sx={{minWidth: 40, color: 'text.secondary'}}>
                        <PhoneIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="טלפון" secondary={patient.phone || 'לא הוזן'} />
                </ListItem>
                 <ListItem disablePadding>
                    <ListItemIcon sx={{minWidth: 40, color: 'text.secondary'}}>
                        <MailOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="מייל" secondary={patient.email || 'לא הוזן'} />
                </ListItem>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'text.secondary' }}>
                    <FamilyRestroomIcon fontSize="small"/>
                    קשרים משפחתיים
                </Typography>
                {patient.relationships && patient.relationships.length > 0 ? (
                     <List dense disablePadding>
                        {patient.relationships.map(rel => (
                            <ListItem key={rel.relatedPatientId} disablePadding sx={{mb: 1}}>
                                <ListItemIcon sx={{minWidth: 40}}>
                                    <Avatar sx={{width: 32, height: 32, bgcolor: 'secondary.light', color: 'secondary.dark', fontSize: '1rem' }}>
                                        <EscalatorWarningIcon fontSize="small"/>
                                    </Avatar>
                                </ListItemIcon>
                                <ListItemText 
                                    primary={patientMap.get(rel.relatedPatientId) || 'לא ידוע'} 
                                    secondary={rel.relationshipType} 
                                />
                                <Button size="small" variant="text" onClick={() => setSelectedPatientId(rel.relatedPatientId)}>
                                    מעבר לתיק
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 2}}>אין מטופלים מקושרים.</Typography>
                )}
            </Box>
        </Card>
    );
};