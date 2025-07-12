/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
// @ts-ignore
import 'moment/locale/he';
// @ts-ignore
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Appointment, Profile, TherapeuticCenter } from '../types';
import { Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { AppointmentForm } from '../components/AppointmentForm';
import { useClinicStore } from '../store';
import { useUser } from '../context/UserContext';

// Setup the localizer by providing the moment Object
// to the correct localizer.
moment.locale('he');
const localizer = momentLocalizer(moment);

const therapistColors = ['#5850ec', '#1aae8d', '#f5a623', '#d9534f', '#5cb85c', '#757575', '#6e4f9b'];
const therapeuticCenters: TherapeuticCenter[] = ['מרכז למשפחה', 'טיפול באלימות', 'מרכז להורות', 'לא שויך'];

export const CalendarView: React.FC = () => {
    const userProfile = useUser();
    const { appointments, patients, therapists, saveAppointment, deleteAppointment } = useClinicStore();
    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date} | null>(null);
    const [centerFilter, setCenterFilter] = useState('all');
    const [therapistFilter, setTherapistFilter] = useState('all');

    const patientCenterMap = new Map(patients.map(p => [p.id, p.therapeuticCenter]));

    const filteredAppointments = appointments.filter(app => {
        const centerMatch = centerFilter === 'all' || (app.patientId && patientCenterMap.get(app.patientId) === centerFilter);
        const therapistMatch = therapistFilter === 'all' || app.therapistId === therapistFilter;
        return centerMatch && therapistMatch;
    });

    const eventStyleGetter = (event: Appointment) => {
        const therapistIndex = therapists.findIndex(t => t.id === event.therapistId);
        const color = therapistIndex !== -1 
            ? therapistColors[therapistIndex % therapistColors.length] 
            : '#868e96'; // A neutral default color
        
        const style = {
            backgroundColor: color,
            borderRadius: '5px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return {
            style: style
        };
    };

    const handleSelectEvent = (event: Appointment) => {
        setSelectedAppointment(event);
        setSelectedSlot(null);
        setFormOpen(true);
    };

    const handleSelectSlot = (slotInfo: { start: Date, end: Date }) => {
        setSelectedAppointment(null);
        setSelectedSlot(slotInfo);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setSelectedAppointment(null);
        setSelectedSlot(null);
    };

    const handleSave = (appointment: Omit<Appointment, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => {
        if (!userProfile) return;
        saveAppointment(appointment, userProfile);
        handleCloseForm();
    };
    
    const handleDelete = (appointmentId: string) => {
        deleteAppointment(appointmentId);
        handleCloseForm();
    }

    return (
        <>
            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
                <Grid>
                    <Typography variant="h4" sx={{ fontWeight: '700' }}>
                        יומן פגישות
                    </Typography>
                </Grid>
                <Grid xs={12} sm={4} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>סינון לפי מרכז</InputLabel>
                        <Select value={centerFilter} label="סינון לפי מרכז" onChange={(e) => setCenterFilter(e.target.value)}>
                            <MenuItem value="all">כל המרכזים</MenuItem>
                            {therapeuticCenters.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                 <Grid xs={12} sm={4} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>סינון לפי מטפל/ת</InputLabel>
                        <Select value={therapistFilter} label="סינון לפי מטפל/ת" onChange={(e) => setTherapistFilter(e.target.value)}>
                            <MenuItem value="all">כל המטפלים</MenuItem>
                            {therapists.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Paper sx={{ p: 2, height: 'calc(100vh - 240px)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                <Box sx={{ height: '100%' }}>
                    <Calendar
                        localizer={localizer}
                        events={filteredAppointments}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        rtl={true}
                        selectable
                        onSelectEvent={handleSelectEvent}
                        onSelectSlot={handleSelectSlot}
                        messages={{
                            next: "הבא",
                            previous: "הקודם",
                            today: "היום",
                            month: "חודש",
                            week: "שבוע",
                            day: "יום",
                            agenda: "סדר יום",
                            date: "תאריך",
                            time: "שעה",
                            event: "אירוע",
                            showMore: total => `+${total} נוספים`
                        }}
                        eventPropGetter={eventStyleGetter}
                    />
                </Box>
            </Paper>
            <AppointmentForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSave={handleSave}
                onDelete={handleDelete}
                appointment={selectedAppointment}
                slot={selectedSlot}
                patients={patients}
                therapists={therapists}
            />
        </>
    );
}