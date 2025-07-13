import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import heLocale from '@fullcalendar/core/locales/he';

const CalendarPage: React.FC = () => {
    // Mock events for demonstration
    const events = [
        { title: 'פגישה עם יוסי כהן', start: new Date().toISOString().substring(0, 10) + 'T10:00:00', end: new Date().toISOString().substring(0, 10) + 'T11:00:00', color: '#6200EE' },
        { title: 'טיפול זוגי - לוי', start: new Date().toISOString().substring(0, 10) + 'T14:00:00', end: new Date().toISOString().substring(0, 10) + 'T15:30:00', color: '#03DAC6' },
        { title: 'פגישה עם דנה גולן', start: new Date(Date.now() + 86400000).toISOString().substring(0, 10) + 'T12:00:00', end: new Date(Date.now() + 86400000).toISOString().substring(0, 10) + 'T13:00:00', color: '#ff9800' }
    ];

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                יומן פגישות
            </Typography>
            <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: 'calc(100vh - 160px)' }}>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    headerToolbar={{
                        right: 'prev,next today', // Swapped for RTL
                        center: 'title',
                        left: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // Swapped for RTL
                    }}
                    initialView="dayGridMonth"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    events={events}
                    locale={heLocale}
                    direction="rtl"
                    height="100%"
                />
            </Paper>
        </Box>
    );
};

export default CalendarPage;