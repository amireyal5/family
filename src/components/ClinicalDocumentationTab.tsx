/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
    Box, Typography, Button, Card, CardContent, CardHeader, Divider, List, ListItem, ListItemText, TextField
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Patient } from '../types';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import moment from 'moment';
import { useClinicStore } from '../store';

interface ClinicalDocumentationTabProps {
    patient: Patient;
}

export const ClinicalDocumentationTab: React.FC<ClinicalDocumentationTabProps> = ({ patient }) => {
    const { currentUser, addClinicalNote } = useClinicStore();
    const [newNote, setNewNote] = useState('');

    const notes = patient.clinicalNotes;

    const handleSaveNote = () => {
        if (newNote.trim() === '' || !currentUser) return;
        
        addClinicalNote(patient.id, newNote);
        setNewNote('');
    };
    
    return (
        <Grid container spacing={3}>
            {/* Session Summaries Section */}
            <Grid xs={12} md={7}>
                <Card>
                    <CardHeader
                        title="תיעוד וסיכומי פגישות"
                    />
                    <Divider />
                    <CardContent>
                       <TextField
                            label="סיכום פגישה חדש"
                            multiline
                            rows={8}
                            fullWidth
                            variant="outlined"
                            placeholder="כתוב כאן את סיכום הפגישה..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                       />
                        <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end'}}>
                             <Button variant="contained" onClick={handleSaveNote} disabled={!newNote.trim()}>שמור סיכום</Button>
                        </Box>
                    </CardContent>
                     <Divider />
                    <CardContent>
                         <Typography variant="h6" gutterBottom>היסטוריית סיכומים</Typography>
                         <List sx={{maxHeight: 300, overflow: 'auto'}}>
                            {notes.length > 0 ? [...notes].sort((a,b) => moment(b.date).diff(moment(a.date))).map(note => (
                                <ListItem key={note.id} alignItems="flex-start">
                                    <ListItemText 
                                        primary={`סיכום מתאריך ${moment(note.date).format('DD/MM/YYYY')}`} 
                                        secondary={
                                            <>
                                                <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                                                    נכתב ע''י {note.author}
                                                </Typography>
                                                {` — ${note.content}`}
                                            </>
                                        }
                                    />
                                </ListItem>
                            )) : (
                                <Typography sx={{textAlign: 'center', p:2, color: 'text.secondary'}}>
                                    לא קיימים סיכומי פגישות.
                                </Typography>
                            )}
                         </List>
                    </CardContent>
                </Card>
            </Grid>

            {/* File Uploads Section */}
            <Grid xs={12} md={5}>
                <Card>
                    <CardHeader
                        title="מסמכים וקבצים"
                        action={
                            <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
                                העלה קובץ
                                <input type="file" hidden />
                            </Button>
                        }
                    />
                    <Divider />
                    <CardContent>
                        <List>
                            <ListItem>
                                <ListItemText primary="הפניה_מרווחה.pdf" secondary="הועלה בתאריך 20/08/2023" />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="טופס_הסכמה_חתום.pdf" secondary="הועלה בתאריך 21/08/2023" />
                            </ListItem>
                             <ListItem>
                                <ListItemText primary="אבחון_פסיכולוגי.docx" secondary="הועלה בתאריך 10/09/2023" />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};