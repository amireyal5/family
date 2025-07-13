import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SettingsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                הגדרות מערכת
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">ניהול מערכת</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    כאן יוצגו אפשרויות ניהול למנהלים בלבד, כולל:<br />
                    ניהול משתמשים, ניהול חדרים, סוגי טיפול, וצפייה ביומן הפעולות.
                </Typography>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
