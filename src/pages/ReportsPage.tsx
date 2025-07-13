import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                דוחות וניתוחים
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">דוחות גרפיים</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    כאן יוצגו דוחות וניתוחים חזותיים על פעילות המרכז,<br />
                    כולל התפלגות מטופלים, הכנסות, ניצול חדרים ועוד.
                </Typography>
            </Paper>
        </Box>
    );
};

export default ReportsPage;
