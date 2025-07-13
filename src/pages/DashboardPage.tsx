import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import useAuthStore from '../store/authStore';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactElement;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Paper
        elevation={3}
        sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '12px',
            backgroundColor: 'background.paper',
            height: '100%',
        }}
    >
        <Box>
            <Typography color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h5" component="div">
                {value}
            </Typography>
        </Box>
        <Box sx={{ color, fontSize: 40 }}>
            {icon}
        </Box>
    </Paper>
);

const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();

    // Mock data for demonstration
    const stats = [
        { title: 'מטופלים פעילים', value: '124', icon: <PeopleAltIcon />, color: 'primary.main' },
        { title: 'תורים להיום', value: '18', icon: <EventIcon />, color: 'secondary.main' },
        { title: 'הכנסה חודשית', value: '₪12,500', icon: <AccountBalanceWalletIcon />, color: 'success.main' },
        { title: 'משימות ממתינות', value: '5', icon: <PendingActionsIcon />, color: 'warning.main' },
    ];

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                ברוך הבא, {user?.name || 'משתמש'}!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                להלן סיכום הפעילות במרכז.
            </Typography>

            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>
            
            {/* Future widgets can be added here */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={8}>
                   <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: '300px'}}>
                       <Typography variant="h6">סקירת פעילות</Typography>
                       <Typography color="text.secondary">גרף יוצג כאן.</Typography>
                   </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                   <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: '300px'}}>
                       <Typography variant="h6">הפניות אחרונות</Typography>
                       <Typography color="text.secondary">רשימת הפניות חדשות.</Typography>
                   </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
