/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
  Avatar,
  Button,
  Paper,
  Box,
  Typography,
  Container,
  TextField,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useClinicStore } from '../store';
import { signInWithEmail } from '../lib/auth';


export const LoginScreen: React.FC = () => {
  const { setView } = useClinicStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signInWithEmail({ email, password });
    if (error) {
        if (error.message === 'Invalid login credentials') {
            setError('שם משתמש או סיסמה שגויים');
        } else {
            setError(error.message);
        }
    }
    // onAuthStateChange in UserContext will handle view change on successful login
    setLoading(false);
  };

  return (
     <Container component="main" maxWidth="xs" sx={{display: 'flex', alignItems: 'center', height: '100vh'}}>
      <Paper elevation={0} sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        border: '1px solid var(--border-color)',
        width: '100%'
      }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          כניסה למערכת
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="כתובת אימייל"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="סיסמה"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
             {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, position: 'relative' }}
          >
            {loading ? <CircularProgress size={24} sx={{color: 'white', position: 'absolute'}}/> : 'כניסה'}
          </Button>
           <Divider sx={{ my: 2 }}>או</Divider>
           <Button
            fullWidth
            variant="outlined"
            onClick={() => setView('referral')}
            sx={{ mt: 1 }}
        >
            הפניה עצמית לטיפול
        </Button>
        </Box>
      </Paper>
    </Container>
  );
};