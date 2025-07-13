import React from 'react';
import { Box, Typography, Paper, Container, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ReferralPage: React.FC = () => {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'background.default',
        }}>
            <Container component="main" maxWidth="sm">
                <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography component="h1" variant="h4" align="center" gutterBottom fontWeight="bold">
                        טופס הפניה למרכז
                    </Typography>
                    <Typography component="p" variant="body2" color="text.secondary" align="center" sx={{mb: 3}}>
                      נא למלא את הפרטים ונחזור אליכם בהקדם.
                    </Typography>
                    <Box component="form" noValidate sx={{ mt: 1 }}>
                        <TextField margin="normal" required fullWidth label="שם מלא" />
                        <TextField margin="normal" required fullWidth label="טלפון ליצירת קשר" />
                        <TextField margin="normal" required fullWidth label="כתובת דוא''ל" />
                        <TextField margin="normal" required fullWidth multiline rows={4} label="תיאור קצר של סיבת הפנייה" />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            שליחת הפנייה
                        </Button>
                    </Box>
                </Paper>
                 <Typography variant="body2" color="text.secondary" align="center" sx={{mt: 4}}>
                    צוות המרכז? <Link to="/login">לחצו כאן לכניסה</Link>
                </Typography>
            </Container>
        </Box>
    );
};

export default ReferralPage;
