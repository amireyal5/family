/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
  Avatar,
  Button,
  Paper,
  Box,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useClinicStore } from '../store';


export const LoginScreen: React.FC = () => {
  const { users, login, setView } = useClinicStore();
  const [selectedUserId, setSelectedUserId] = React.useState<string>(users[0]?.id || '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedUser = users.find(u => u.id === selectedUserId);
    if(selectedUser) {
        login(selectedUser);
    }
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
        <Typography variant="body2" color="text.secondary" sx={{mt: 1, mb: 3}}>
            לצורכי הדגמה, אנא בחר משתמש לכניסה.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <FormControl fullWidth required>
                <InputLabel id="user-select-label">בחר משתמש</InputLabel>
                <Select
                    labelId="user-select-label"
                    value={selectedUserId}
                    label="בחר משתמש"
                    onChange={(e) => setSelectedUserId(e.target.value)}
                >
                    {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>{user.name} ({user.role})</MenuItem>
                    ))}
                </Select>
            </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={!selectedUserId}
            sx={{ mt: 3, mb: 2 }}
          >
            כניסה
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