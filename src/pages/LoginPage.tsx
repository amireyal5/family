import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import useAuthStore from '../store/authStore';
import { supabase } from '../services/supabaseClient';

function Copyright(props: any) {
  return (
    <Typography variant="body2" {...props} className="text-center text-gray-500">
      {'כל הזכויות שמורות © '}
      <Link color="inherit" href="#">
        ניהול מרכז טיפולי
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const mapAuthError = (message: string): string => {
    if (message.includes('Invalid login credentials')) {
      return 'שם משתמש או סיסמה שגויים. אנא נסה שנית.';
    }
    if (message.includes('Email not confirmed')) {
      return 'יש לאשר את כתובת הדוא"ל לפני הכניסה.';
    }
    return 'ההתחברות נכשלה. אנא בדוק את הפרטים ונסה שנית.';
  };

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        const role = data.user.user_metadata?.role || 'therapist';
        const name = data.user.user_metadata?.full_name || data.user.email!;
        
        login({ email: data.user.email!, name, role });
        navigate('/dashboard');
      } else {
        throw new Error('ההתחברות נכשלה, אנא נסה שנית.');
      }
    } catch (err: any) {
      setError(mapAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
    }}>
        <Container component="main" maxWidth="xs">
            <Paper elevation={6} sx={{ p: 4, mt: -8, borderRadius: 3 }}>
                <Box
                    sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                    כניסה למערכת
                    </Typography>
                    <Typography component="p" variant="body2" color="text.secondary" align="center" sx={{mt: 1}}>
                      ניהול מרכז טיפולי
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate className="mt-6 w-full">
                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="כתובת דוא''ל"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
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
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, position: 'relative', py: 1.5 }}
                        disabled={loading}
                    >
                        כניסה
                        {loading && (
                        <CircularProgress
                            size={24}
                            sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                            }}
                        />
                        )}
                    </Button>
                    <Link href="#" variant="body2">
                        שכחתי סיסמה
                    </Link>
                    </Box>
                </Box>
            </Paper>
            <Copyright sx={{ mt: 5 }} />
        </Container>
    </Box>
  );
};

export default LoginPage;