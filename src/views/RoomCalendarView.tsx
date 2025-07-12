/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
// @ts-ignore
import 'moment/locale/he';
// @ts-ignore
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Room, Therapist } from '../types';
import { Box, Paper, Typography } from '@mui/material';
import { useClinicStore } from '../store';

moment.locale('he');
const localizer = momentLocalizer(moment);

const therapistColors = ['#5850ec', '#1aae8d', '#f5a623', '#d9534f', '#5cb85c', '#757575', '#6e4f9b', '#4a42d3', '#3498db'];

export const RoomCalendarView: React.FC = () => {
    const { roomBookings: bookings, rooms, therapists } = useClinicStore();
    
    const therapistMap = new Map(therapists.map(t => [t.id, t]));
    const therapistColorMap = new Map(therapists.map((t, i) => [t.id, therapistColors[i % therapistColors.length]]));

    const events = bookings.map(booking => {
        const start = moment(`${booking.date}T${booking.startTime}`).toDate();
        const end = moment(`${booking.date}T${booking.endTime}`).toDate();
        const therapist = booking.therapistId ? therapistMap.get(booking.therapistId) : null;
        
        let title = '';
        if (booking.isBlocked) {
            title = 'חסום';
        } else if (therapist) {
            title = (therapist as Therapist).name;
        } else {
            title = 'פנוי';
        }
        if (booking.notes) {
            title += ` (${booking.notes})`;
        }

        return {
            id: booking.id,
            title: title,
            start: start,
            end: end,
            resourceId: booking.roomId,
            isBlocked: booking.isBlocked,
            therapistId: booking.therapistId,
        };
    });

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#e0e0e0'; // Default/Blocked color
        if (!event.isBlocked && event.therapistId) {
           backgroundColor = therapistColorMap.get(event.therapistId) || '#5850ec';
        }
        
        const style = {
            backgroundColor,
            borderRadius: '5px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block',
        };
        return {
            style: style
        };
    };

    return (
        <>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: '700' }}>
                יומן חדרים
            </Typography>
            <Paper sx={{ p: 2, height: 'calc(100vh - 200px)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                <Box sx={{ height: '100%' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        rtl={true}
                        resources={rooms}
                        resourceIdAccessor="id"
                        resourceTitleAccessor={(resource: any) => resource.name}
                        defaultView={Views.DAY}
                        views={[Views.DAY, Views.WEEK]}
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
                            showMore: total => `+${total} נוספים`,
                            noEventsInRange: "אין שיבוצים בטווח זה."
                        }}
                        eventPropGetter={eventStyleGetter}
                    />
                </Box>
            </Paper>
        </>
    );
}