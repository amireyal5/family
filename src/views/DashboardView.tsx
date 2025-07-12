/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Box, Typography, Card, Avatar } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TodayIcon from '@mui/icons-material/Today';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import moment from 'moment';
import { useClinicStore } from '../store';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ display: 'flex', flexDirection: 'column', p: 2.5, height: '100%', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
                <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{mt: 1}}>{value}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 48, height: 48 }}>
                {icon}
            </Avatar>
        </Box>
        {/* Can add a footer with a link or trend chart later */}
    </Card>
);


export const DashboardView: React.FC = () => {
    const { currentUser, patients, therapists, appointments } = useClinicStore();

    if (!currentUser) return null;

    const todayAppointments = appointments.filter(a => moment(a.start).isSame(new Date(), 'day'));
    const activePatients = patients.filter(p => p.status === 'בטיפול').length;
    const waitingPatients = patients.filter(p => p.status === 'בהמתנה לטיפול').length;
    
    const therapistAppointmentsToday = appointments.filter(a => 
        moment(a.start).isSame(new Date(), 'day') && a.therapistId === `therapist_${currentUser.id.split('_')[2]}` // A bit hacky way to link user to therapist
    ).length;


    const renderManagerDashboard = () => (
        <Grid container spacing={3}>
            <Grid lg={3} sm={6} xs={12}>
                <StatCard title="מטופלים פעילים" value={activePatients} icon={<PeopleAltIcon />} color="primary" />
            </Grid>
            <Grid lg={3} sm={6} xs={12}>
                <StatCard title="פגישות להיום" value={todayAppointments.length} icon={<TodayIcon />} color="info" />
            </Grid>
            <Grid lg={3} sm={6} xs={12}>
                <StatCard title="ממתינים לטיפול" value={waitingPatients} icon={<AccessTimeFilledIcon />} color="warning" />
            </Grid>
            <Grid lg={3} sm={6} xs={12}>
                <StatCard title="סה״כ מטפלים" value={therapists.length} icon={<GroupAddIcon />} color="success" />
            </Grid>
             {/* Add more cards for reports and financials here */}
        </Grid>
    );

     const renderTherapistDashboard = () => (
        <Grid container spacing={3}>
            <Grid lg={3} sm={6} xs={12}>
                <StatCard title="פגישות להיום" value={therapistAppointmentsToday} icon={<TodayIcon />} color="primary" />
            </Grid>
             <Grid lg={3} sm={6} xs={12}>
                <StatCard title="מטופלים פעילים" value={patients.filter(p=>p.therapist === currentUser.name).length} icon={<PeopleAltIcon />} color="info" />
            </Grid>
            {/* Add cards for pending notes, etc. */}
        </Grid>
    );
    
    const renderGenericDashboard = () => (
         <Grid container spacing={3}>
            <Grid lg={3} sm={6} xs={12}>
                <StatCard title="סה״כ מטופלים" value={patients.length} icon={<PeopleAltIcon />} color="primary"/>
            </Grid>
            <Grid lg={3} sm={6} xs={12}>
                <StatCard title="פגישות להיום" value={todayAppointments.length} icon={<TodayIcon />} color="info"/>
            </Grid>
             <Grid lg={3} sm={6} xs={12}>
                <StatCard title="ממתינים לטיפול" value={waitingPatients} icon={<AccessTimeFilledIcon />} color="warning"/>
            </Grid>
        </Grid>
    );
    
    const renderDashboardByRole = () => {
        switch(currentUser.role) {
            case 'מנהל/ת':
                return renderManagerDashboard();
            case 'מטפל/ת':
                return renderTherapistDashboard();
            case 'מזכירה':
                return renderGenericDashboard();
            case 'תחשיבנית':
                return renderGenericDashboard();
            default:
                return renderGenericDashboard();
        }
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: '700' }}>
                בוקר טוב, {currentUser.name.split(' ')[0]}
            </Typography>
            {renderDashboardByRole()}
        </Box>
    );
};