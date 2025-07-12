/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
    Box, Typography, Tabs, Tab, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, Button, TextField, IconButton, Paper, Divider, Tooltip
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Role } from '../types';
import moment from 'moment';
import { useClinicStore } from '../store';
import { useUser } from '../context/UserContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const initialNewUserState = { firstName: '', lastName: '', role: 'מזכירה' as Role };
const initialNewTherapistState = { name: '', licenseNumber: '', specialties: '' };
const initialNewRoomState = { name: '', location: '' };

// Mock data for editable lists - in a real app, this would come from backend
const treatmentTypesList = ['טיפול משפחתי', 'טיפול זוגי', 'טיפול פרטני', 'הדרכת הורים', 'טיפול באלימות במשפחה', 'טיפול בשכול', 'טיפול בטראומה', 'טיפול CBT', 'טיפול דינמי', 'ייעוץ', 'אבחון', 'קבוצת תמיכה', 'סדנה'];

export const SettingsView: React.FC = () => {
    const userProfile = useUser();
    const { 
        users, therapists, patients, actionLog, rooms,
        updateUserRole, addUser, addTherapist, updateDiscountStatus, addRoom
    } = useClinicStore();

    const [tabIndex, setTabIndex] = useState(0);
    const [treatmentTypes, setTreatmentTypes] = useState(treatmentTypesList);
    const [newTreatmentType, setNewTreatmentType] = useState('');
    const [newUser, setNewUser] = useState(initialNewUserState);
    const [newTherapist, setNewTherapist] = useState(initialNewTherapistState);
    const [newRoom, setNewRoom] = useState(initialNewRoomState);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleAddTreatmentType = () => {
        if (newTreatmentType.trim() && !treatmentTypes.includes(newTreatmentType.trim())) {
            setTreatmentTypes([...treatmentTypes, newTreatmentType.trim()]);
            setNewTreatmentType('');
        }
    }

    const handleNewUserChange = (event: any) => {
        const { name, value } = event.target;
        setNewUser(prev => ({...prev, [name!]: value}));
    }

    const handleAddUser = () => {
        if (newUser.firstName.trim() && newUser.lastName.trim()) {
            addUser({ name: `${newUser.firstName} ${newUser.lastName}`, role: newUser.role });
            setNewUser(initialNewUserState);
        } else {
            alert("יש למלא שם פרטי ושם משפחה.");
        }
    }
    
    const handleNewTherapistChange = (event: any) => {
        const { name, value } = event.target;
        setNewTherapist(prev => ({...prev, [name!]: value}));
    }

    const handleAddTherapist = () => {
        if (!userProfile) return;
        if (newTherapist.name.trim()) {
            addTherapist({
                name: newTherapist.name,
                licenseNumber: newTherapist.licenseNumber,
                specialties: newTherapist.specialties.split(',').map(s => s.trim()).filter(Boolean)
            }, userProfile);
            setNewTherapist(initialNewTherapistState);
        } else {
             alert("יש למלא שם מלא.");
        }
    }

    const handleNewRoomChange = (event: any) => {
        const { name, value } = event.target;
        setNewRoom(prev => ({...prev, [name!]: value}));
    }

    const handleAddRoom = () => {
        if (newRoom.name.trim()) {
            addRoom({ name: newRoom.name, location: newRoom.location });
            setNewRoom(initialNewRoomState);
        } else {
             alert("יש למלא שם חדר.");
        }
    }

    const handleUpdateDiscountStatus = (patientId: string, discountId: string, status: 'מאושר' | 'נדחה') => {
        if (!userProfile) return;
        updateDiscountStatus(patientId, discountId, status, userProfile);
    }

    const pendingDiscounts = patients.flatMap(p => 
        p.discounts
            .filter(d => d.status === 'ממתין לאישור')
            .map(d => ({ ...d, patientName: `${p.firstName} ${p.lastName}`, patientId: p.id }))
    );

    const roles: Role[] = ['מנהל/ת', 'מטפל/ת', 'מזכירה', 'תחשיבנית', 'שומר'];


    return (
        <>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: '700' }}>הגדרות מערכת</Typography>
        <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="settings tabs" variant="scrollable" scrollButtons="auto">
                    <Tab label="ניהול משתמשים" />
                    <Tab label="ניהול מטפלים" />
                    <Tab label="ניהול חדרים" />
                    <Tab label="אישור הנחות" />
                    <Tab label="יומן פעולות" />
                    <Tab label="ניהול רשימות" />
                </Tabs>
            </Box>
            <TabPanel value={tabIndex} index={0}>
                <Typography variant="h6" gutterBottom>ניהול הרשאות משתמשים</Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>שם משתמש</TableCell>
                                <TableCell>תפקיד נוכחי</TableCell>
                                <TableCell>שינוי תפקיד</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell sx={{width: '250px'}}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>בחר תפקיד חדש</InputLabel>
                                            <Select
                                                value={user.role}
                                                label="בחר תפקיד חדש"
                                                onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                                            >
                                                {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom>הוספת עובד/ת חדש/ה</Typography>
                 <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} sm={4}>
                             <TextField
                                name="firstName"
                                label="שם פרטי"
                                value={newUser.firstName}
                                onChange={handleNewUserChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid xs={12} sm={4}>
                             <TextField
                                name="lastName"
                                label="שם משפחה"
                                value={newUser.lastName}
                                onChange={handleNewUserChange}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid xs={12} sm={3}>
                             <FormControl fullWidth size="small">
                                <InputLabel>תפקיד</InputLabel>
                                <Select name="role" value={newUser.role} label="תפקיד" onChange={handleNewUserChange}>
                                    {roles.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid xs={12} sm={1}>
                            <Button variant="contained" onClick={handleAddUser} fullWidth>הוסף</Button>
                        </Grid>
                    </Grid>
                 </Paper>

            </TabPanel>
             <TabPanel value={tabIndex} index={1}>
                <Typography variant="h6" gutterBottom>ניהול מטפלים</Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>שם מלא</TableCell>
                                <TableCell>מספר רישיון</TableCell>
                                <TableCell>התמחויות</TableCell>
                                <TableCell align="right">פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {therapists.map((therapist) => (
                                <TableRow key={therapist.id} hover>
                                    <TableCell>{therapist.name}</TableCell>
                                    <TableCell>{therapist.licenseNumber || '-'}</TableCell>
                                    <TableCell>{therapist.specialties?.join(', ') || '-'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="עריכה (בקרוב)">
                                            <span>
                                                <IconButton size="small" disabled>
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                         <Tooltip title="מחיקה (בקרוב)">
                                            <span>
                                                <IconButton size="small" disabled>
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom>הוספת מטפל/ת חדש/ה</Typography>
                 <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} sm={4}>
                             <TextField name="name" label="שם מלא" value={newTherapist.name} onChange={handleNewTherapistChange} fullWidth size="small" required />
                        </Grid>
                        <Grid xs={12} sm={3}>
                             <TextField name="licenseNumber" label="מספר רישיון" value={newTherapist.licenseNumber} onChange={handleNewTherapistChange} fullWidth size="small" />
                        </Grid>
                         <Grid xs={12} sm={4}>
                             <TextField name="specialties" label="התמחויות (מופרד בפסיק)" value={newTherapist.specialties} onChange={handleNewTherapistChange} fullWidth size="small" />
                        </Grid>
                         <Grid xs={12} sm={1}>
                            <Button variant="contained" onClick={handleAddTherapist} fullWidth>הוסף</Button>
                        </Grid>
                    </Grid>
                 </Paper>
            </TabPanel>
             <TabPanel value={tabIndex} index={2}>
                <Typography variant="h6" gutterBottom>ניהול חדרי טיפול</Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>שם החדר</TableCell>
                                <TableCell>מיקום</TableCell>
                                <TableCell align="right">פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rooms.map((room) => (
                                <TableRow key={room.id} hover>
                                    <TableCell>{room.name}</TableCell>
                                    <TableCell>{room.location || '-'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="עריכה (בקרוב)">
                                            <span>
                                                <IconButton size="small" disabled>
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                         <Tooltip title="מחיקה (בקרוב)">
                                            <span>
                                                <IconButton size="small" disabled>
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom>הוספת חדר חדש</Typography>
                 <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} sm={5}>
                             <TextField name="name" label="שם החדר" value={newRoom.name} onChange={handleNewRoomChange} fullWidth size="small" required />
                        </Grid>
                        <Grid xs={12} sm={5}>
                             <TextField name="location" label="מיקום (למשל, קומה ב')" value={newRoom.location} onChange={handleNewRoomChange} fullWidth size="small" />
                        </Grid>
                         <Grid xs={12} sm={2}>
                            <Button variant="contained" onClick={handleAddRoom} fullWidth>הוסף חדר</Button>
                        </Grid>
                    </Grid>
                 </Paper>
            </TabPanel>
            <TabPanel value={tabIndex} index={3}>
                 <Typography variant="h6" gutterBottom>בקשות הנחה ממתינות לאישור</Typography>
                 <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                           <TableRow>
                                <TableCell>מטופל</TableCell>
                                <TableCell>מבקש</TableCell>
                                <TableCell>תאריך בקשה</TableCell>
                                <TableCell>בקשה</TableCell>
                                <TableCell>סיבה</TableCell>
                                <TableCell align="center">פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingDiscounts.length > 0 ? pendingDiscounts.map((d) => (
                                <TableRow key={d.id}>
                                    <TableCell>{d.patientName}</TableCell>
                                    <TableCell>{d.requester}</TableCell>
                                    <TableCell>{moment(d.requestDate).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{`${d.type === 'percentage' ? d.value+'%' : '₪'+d.value}`}</TableCell>
                                    <TableCell>{d.reason}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="אישור">
                                            <span>
                                                <IconButton color="success" onClick={() => handleUpdateDiscountStatus(d.patientId, d.id, 'מאושר')}><CheckCircleIcon /></IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="דחייה">
                                            <span>
                                                <IconButton color="error" onClick={() => handleUpdateDiscountStatus(d.patientId, d.id, 'נדחה')}><CancelIcon /></IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} align="center">אין בקשות הממתינות לאישור</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                 </TableContainer>
            </TabPanel>
             <TabPanel value={tabIndex} index={4}>
                 <Typography variant="h6" gutterBottom>יומן פעולות מערכת</Typography>
                 <TableContainer component={Paper} variant="outlined" sx={{maxHeight: 600}}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow><TableCell>תאריך ושעה</TableCell><TableCell>מבצע הפעולה</TableCell><TableCell>מטופל</TableCell><TableCell>סוג פעולה</TableCell><TableCell>פירוט</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                            {actionLog.map(log => (
                                <TableRow key={log.id} hover>
                                    <TableCell>{moment(log.timestamp).format('DD/MM/YYYY HH:mm')}</TableCell>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>{patients.find(p=>p.id === log.patientId)?.firstName} {patients.find(p=>p.id === log.patientId)?.lastName}</TableCell>
                                    <TableCell>{log.type}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </TableContainer>
            </TabPanel>
             <TabPanel value={tabIndex} index={5}>
                 <Typography variant="h6" gutterBottom>עריכת רשימת "סוגי טיפול"</Typography>
                 <Box sx={{display: 'flex', gap: 1, mb: 2}}>
                    <TextField 
                        size="small"
                        label="הוסף סוג טיפול חדש"
                        value={newTreatmentType}
                        onChange={(e) => setNewTreatmentType(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTreatmentType()}
                    />
                    <Button variant="contained" onClick={handleAddTreatmentType} startIcon={<AddIcon />}>הוסף</Button>
                 </Box>
                 <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                           <TableRow>
                                <TableCell>שם</TableCell>
                                <TableCell align="right">פעולות</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {treatmentTypes.map((type) => (
                                <TableRow key={type}>
                                    <TableCell>{type}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="עריכה">
                                            <span>
                                                <IconButton size="small"><EditIcon fontSize="small"/></IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </TableContainer>
            </TabPanel>
        </Card>
        </>
    );
};