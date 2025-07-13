import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const KnowledgeBasePage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                מאגר ידע
            </Typography>
            <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">נהלים, מדריכים ומאמרים פנימיים</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                    כאן יוצג מאגר ידע פנימי לצוות המרכז. <br />
                    ניתן יהיה ליצור, לערוך ולחפש מאמרים ונהלים.
                </Typography>
            </Paper>
        </Box>
    );
};

export default KnowledgeBasePage;
