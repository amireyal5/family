

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Tooltip,
    TextField,
    Chip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import moment from 'moment';
import { Room, RoomBooking, Therapist } from '../types';
import { RoomBookingModal } from '../components/RoomBookingModal';

interface RoomManagementViewProps {
    rooms: Room[];
    therapists: Therapist[];
    bookings: RoomBooking[];
    onSaveBooking: (booking: Omit<RoomBooking, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { id?: string }) => void;
    onDeleteBooking: (booking: Pick<RoomBooking, 'date' | 'startTime' | 'roomId'>) => void;
}


const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #print-schedule-content, #print-schedule-content * {
      visibility: visible;
    }
    #print-schedule-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 1rem;
      border: none !important;
      box-shadow: none !important;
    }
    .no-print {
      display: none !important;
    }
    @page {
      size: A4 landscape;
      margin: 1cm;
    }
    h4 {
        font-size: 18pt !important;
        text-align: center;
        font-family: 'Assistant', sans-serif;
    }
    .print-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Assistant', sans-serif;
    }
    .print-table th, .print-table td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: center;
    }
    .print-table th {
        background-color: #f2f2f2;
    }
  }
`;

// Define timeSlots as a constant outside the component to prevent environment-related errors.
const timeSlots: string[] = Array.from({ length: 26 }, (_, i: number): string => {
    const hour: number = 8 + Math.floor(i / 2);
    const minute: number = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});


export const RoomManagementView: React.FC<RoomManagementViewProps> = ({ rooms, therapists, bookings, onSaveBooking, onDeleteBooking }) => {
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<(RoomBooking | Omit<RoomBooking, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'isBlocked'> & { isBlocked?: boolean }) | null>(null);

    const therapistMap = useMemo(() => new Map(therapists.map(t => [t.id, t])), [therapists]);
    
    const bookingsForDate = useMemo(() => {
        return bookings.filter(b => b.date === selectedDate);
    }, [bookings, selectedDate]);
    
    const handleSlotClick = (roomId: string, time: string) => {
        const slotMoment = moment(`${selectedDate} ${time}`, 'YYYY-MM-DD HH:mm');
        
        const existingBooking = bookingsForDate.find(b => {
            const startMoment = moment(`${b.date}T${b.startTime}`);
            const endMoment = moment(`${b.date}T${b.endTime}`);
            return b.roomId === roomId && slotMoment.isBetween(startMoment, endMoment, 'minute', '[)');
        });

        if (existingBooking) {
            setSelectedSlot(existingBooking);
        } else {
            const endTime = moment(time, 'HH:mm').add(60, 'minutes').format('HH:mm');
            setSelectedSlot({
                date: selectedDate,
                roomId,
                startTime: time,
                endTime,
                isBlocked: false,
                notes: '',
                therapistId: ''
            });
        }
        setFormOpen(true);
    };


    const handleSave = (bookingData: Omit<RoomBooking, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { id?: string }) => {
        onSaveBooking(bookingData);
        setFormOpen(false);
    };

    const handleDelete = (bookingData: Pick<RoomBooking, 'date' | 'startTime' | 'roomId'>) => {
        onDeleteBooking(bookingData);
        setFormOpen(false);
    }
    
     const handlePrint = () => {
        const printContent = document.getElementById('print-schedule-content')?.innerHTML;
        const printWindow = window.open('', '_blank');
        if (printWindow && printContent) {
            printWindow.document.write(`<html><head><title>לוח שיבוץ</title><style>${printStyles}</style></head><body dir="rtl">${printContent}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 500);
        }
    };

    const renderScheduleForPrint = () => (
        <div id="print-schedule-content" style={{ display: 'none' }}>
             <h4 style={{fontFamily: 'sans-serif', textAlign: 'center'}}>
                שיבוץ חדרים - {moment(selectedDate).format('dddd, DD/MM/YYYY')}
            </h4>
            <table className="print-table">
                <thead>
                    <tr>
                        <th>שעה</th>
                        {rooms.map(room => <th key={room.id}>{room.name}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map(time => (
                        <tr key={time}>
                            <td>{time}</td>
                            {rooms.map(room => {
                                 const slotMoment = moment(`${selectedDate} ${time}`, 'YYYY-MM-DD HH:mm');
                                 const bookingForSlot = bookingsForDate.find(b => {
                                     const startMoment = moment(`${b.date}T${b.startTime}`);
                                     const endMoment = moment(`${b.date}T${b.endTime}`);
                                     return b.roomId === room.id && slotMoment.isBetween(startMoment, endMoment, 'minute', '[)');
                                 });

                                let content = '';
                                if (bookingForSlot && time === bookingForSlot.startTime) {
                                    if (bookingForSlot.isBlocked) {
                                        content = bookingForSlot.notes || 'חסום';
                                    } else if (bookingForSlot.therapistId) {
                                        const therapist = therapistMap.get(bookingForSlot.therapistId);
                                        content = therapist ? therapist.name : 'משובץ';
                                    }
                                }
                                return <td key={`${room.id}-${time}`}>{content}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
        <style>{printStyles}</style>
            <Box>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} className="no-print">
                    <Grid>
                        <Typography variant="h4" sx={{ fontWeight: '700' }}>ניהול שיבוץ חדרים</Typography>
                    </Grid>
                    <Grid display="flex" gap={2}>
                        <TextField
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            label="בחר תאריך"
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                        <Button
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                        >
                            הדפס לוח יומי
                        </Button>
                    </Grid>
                </Grid>

                <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid var(--border-color)' }} className="no-print">
                    <Box sx={{ overflowX: 'auto', p: 1 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: `80px repeat(${rooms.length}, minmax(150px, 1fr))`, gap: '1px', backgroundColor: 'var(--border-color)', direction: 'rtl' }}>
                            {/* Header Row */}
                            <Box sx={{ p: 1, backgroundColor: 'background.default', fontWeight: 'bold', position: 'sticky', right: 0, zIndex: 2 }}>שעה</Box>
                            {rooms.map(room => (
                                <Box key={room.id} sx={{ p: 1.5, backgroundColor: 'background.default', textAlign: 'center', fontWeight: 'bold' }}>{room.name}</Box>
                            ))}

                            {/* Time Slots */}
                            {timeSlots.map(time => (
                                <React.Fragment key={time}>
                                    <Box sx={{ p: 1, backgroundColor: 'background.default', fontWeight: 'bold', position: 'sticky', right: 0, zIndex: 2 }}>{time}</Box>
                                    {rooms.map(room => {
                                        const slotMoment = moment(`${selectedDate} ${time}`, 'YYYY-MM-DD HH:mm');
                                        const bookingForSlot = bookingsForDate.find(b => {
                                            const startMoment = moment(`${b.date}T${b.startTime}`);
                                            const endMoment = moment(`${b.date}T${b.endTime}`);
                                            return b.roomId === room.id && slotMoment.isBetween(startMoment, endMoment, 'minute', '[)');
                                        });

                                        let cellContent = null;
                                        let bgColor = 'background.paper';
                                        let tooltipText = `חדר ${room.name}, ${time}`;
                                        
                                        if (bookingForSlot) {
                                            const isStartOfBooking = time === bookingForSlot.startTime;
                                            const therapist = therapistMap.get(bookingForSlot.therapistId || '');
                                            
                                            if (bookingForSlot.isBlocked) {
                                                bgColor = 'action.hover';
                                                tooltipText = `חסום: ${bookingForSlot.notes || ''}`;
                                                if (isStartOfBooking) {
                                                    cellContent = <Chip label={bookingForSlot.notes || 'חסום'} size="small" sx={{width: '100%'}}/>;
                                                }
                                            } else if (therapist) {
                                                bgColor = 'primary.light';
                                                tooltipText = `משובץ: ${therapist.name}`;
                                                if (isStartOfBooking) {
                                                    cellContent = <Chip label={therapist.name} size="small" color="primary" sx={{width: '100%'}} />;
                                                }
                                            }
                                        }

                                        return (
                                            <Tooltip title={tooltipText} key={`${time}-${room.id}`} placement="top">
                                                <Box
                                                    onClick={() => handleSlotClick(room.id, time)}
                                                    sx={{
                                                        minHeight: 50,
                                                        backgroundColor: bgColor,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '4px',
                                                        transition: 'background-color 0.2s',
                                                        '&:hover': {
                                                            backgroundColor: 'primary.main',
                                                            opacity: 0.2
                                                        }
                                                    }}
                                                >
                                                    {cellContent}
                                                </Box>
                                            </Tooltip>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </Box>
                    </Box>
                </Paper>
            </Box>
            {isFormOpen && (
              <RoomBookingModal
                open={isFormOpen}
                onClose={() => setFormOpen(false)}
                bookingData={selectedSlot}
                therapists={therapists}
                rooms={rooms}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            )}
            {renderScheduleForPrint()}
        </>
    );

};