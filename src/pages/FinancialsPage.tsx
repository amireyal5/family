import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FinancialsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                ניהול כספים
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">סקירה פיננסית</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    כאן יוצגו מודולים לניהול חיובים, תשלומים, הנחות ודוחות כספיים.
                </Typography>
            </Paper>
        </Box>
    );
};

export default FinancialsPage;
