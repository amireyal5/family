import React from 'react';
import { Box, Typography, Paper, Avatar, TextField, Button } from '@mui/material';
import useAuthStore from '../store/authStore';

const ProfilePage: React.FC = () => {
    const { user } = useAuthStore();

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                הפרופיל שלי
            </Typography>
            <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', maxWidth: '600px', mx: 'auto' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <TextField
                        label="שם מלא"
                        defaultValue={user?.name}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="filled"
                        fullWidth
                    />
                    <TextField
                        label="כתובת דוא''ל"
                        defaultValue={user?.email}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="filled"
                        fullWidth
                    />
                    <TextField
                        label="תפקיד"
                        defaultValue={user?.role}
                        InputProps={{
                            readOnly: true,
                        }}
                        variant="filled"
                        fullWidth
                    />
                    <Button variant="contained" sx={{ mt: 2 }}>
                        עדכון סיסמה
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProfilePage;
