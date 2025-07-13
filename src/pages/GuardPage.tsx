import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

const GuardPage: React.FC = () => {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    תצוגת שומר - פגישות להיום
                </Typography>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
                    הדפסה
                </Button>
            </Box>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">רשימת פגישות</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    כאן תוצג רשימה פשוטה וברורה של הפגישות להיום עם אפשרות לביצוע "צ'ק-אין".<br />
                    הרשימה תתעדכן בזמן אמת.
                </Typography>
            </Paper>
        </Box>
    );
};

export default GuardPage;
