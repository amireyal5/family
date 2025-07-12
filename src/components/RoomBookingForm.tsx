/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, FormControlLabel, Checkbox, IconButton, Tooltip
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteIcon from '@mui/icons-material/Delete';
import { RoomBooking, Therapist, Room } from '../types';
import moment from 'moment';

interface RoomBookingFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (booking: Omit<RoomBooking, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { id?: string }) => void;
    onDelete: (booking: Pick<RoomBooking, 'date' | 'startTime' | 'roomId'>) => void;
    bookingData: (RoomBooking | Omit<RoomBooking, 'id' | 'createdAt'|'createdBy'|'updatedAt'|'updatedBy'>) | null;
    therapists: Therapist[];
    rooms: Room[];
}

const getInitialState = (bookingData: RoomBookingFormProps['bookingData']) => {
    if (!bookingData) {
        return {
            date: '',
            startTime: '',
            endTime: '',
            roomId: '',
            therapistId: '',
            notes: '',
            isBlocked: false,
        };
    }
    return { 
        ...bookingData,
        therapistId: bookingData.therapistId || '',
        notes: bookingData.notes || '',
        isBlocked: bookingData.isBlocked || false,
    };
};


export const RoomBookingForm: React.FC<RoomBookingFormProps> = ({ open, onClose, onSave, onDelete, bookingData, therapists, rooms }) => {
    const [formData, setFormData] = useState(getInitialState(bookingData));
    const isEditing = !!bookingData?.therapistId || !!(bookingData as RoomBooking)?.isBlocked;

    useEffect(() => {
        setFormData(getInitialState(bookingData));
    }, [bookingData, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;
        const checked = (event.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        if (!formData.isBlocked && !formData.therapistId) {
            alert('יש לשבץ מטפל/ת או לסמן את השעה כחסומה.');
            return;
        }

        const dataToSave: Omit<RoomBooking, 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> & { id?: string } = {
            id: (formData as RoomBooking).id,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            roomId: formData.roomId,
            notes: formData.notes,
            isBlocked: formData.isBlocked,
            therapistId: formData.isBlocked ? undefined : formData.therapistId,
        };
        
        onSave(dataToSave);
    };
    
    const handleDelete = () => {
        if (bookingData) {
            onDelete({date: bookingData.date, startTime: bookingData.startTime, roomId: bookingData.roomId });
        }
    };
    
    const roomName = rooms.find(r => r.id === formData.roomId)?.name || '';
    const title = isEditing ? `עריכת שיבוץ` : `שיבוץ חדש`;
    const subtitle = `${roomName} | ${moment(formData.date).format('DD/MM/YYYY')} | ${formData.startTime} - ${formData.endTime}`;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Box>
                  {title}
                  <Box component="span" sx={{fontSize: '0.9rem', color: 'text.secondary', display: 'block'}}>{subtitle}</Box>
                </Box>
                 {isEditing && (
                    <Tooltip title="בטל שיבוץ">
                        <div>
                            <IconButton onClick={handleDelete} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                 )}
            </DialogTitle>
            <DialogContent>
                <Box component="form" noValidate sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid xs={12}>
                             <TextField
                                select
                                name="therapistId"
                                label="מטפל/ת"
                                value={formData.isBlocked ? '' : formData.therapistId}
                                onChange={handleChange}
                                fullWidth
                                disabled={formData.isBlocked}
                            >
                                 <MenuItem value="">
                                    <em>ללא</em>
                                 </MenuItem>
                                {therapists.map(t => (
                                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid xs={12}>
                           <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isBlocked || false}
                                        onChange={handleChange}
                                        name="isBlocked"
                                    />
                                }
                                label="חסום את חלון הזמן (לא לשיבוץ)"
                            />
                        </Grid>
                         <Grid xs={12}>
                            <TextField
                                name="notes"
                                label="הערות לשיבוץ/חסימה"
                                multiline
                                rows={3}
                                value={formData.notes || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose}>ביטול</Button>
                <Button onClick={handleSave} variant="contained">שמור שיבוץ</Button>
            </DialogActions>
        </Dialog>
    );
};