import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const RoomsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                ניהול חדרים
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">ממשק שיבוץ חדרים</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    כאן תוצג טבלה ויזואלית לשיבוץ חדרים עם פונקציונליות גרירה ושחרור.
                </Typography>
            </Paper>
        </Box>
    );
};

export default RoomsPage;
