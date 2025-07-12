/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
    Typography,
    Button,
    Card,
    CardHeader,
    CardContent,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    TextField,
    MenuItem,
    Paper,
    TableContainer
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteIcon from '@mui/icons-material/Delete';
import { Patient } from '../types';
import { useClinicStore } from '../store';

interface FamilyConnectionsTabProps {
    patient: Patient;
}

export const FamilyConnectionsTab: React.FC<FamilyConnectionsTabProps> = ({ patient }) => {
    const { patients, addRelationship, removeRelationship } = useClinicStore();
    
    const [newRelationship, setNewRelationship] = useState({
        relatedPatientId: '',
        relationshipType: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setNewRelationship(prev => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        if (!newRelationship.relatedPatientId || !newRelationship.relationshipType) {
            alert('נא לבחור מטופל ולהגדיר את סוג הקשר.');
            return;
        }
        if (patient.relationships.some(r => r.relatedPatientId === newRelationship.relatedPatientId)) {
            alert('קשר עם מטופל זה כבר קיים.');
            return;
        }
        addRelationship(patient.id, newRelationship);
        setNewRelationship({ relatedPatientId: '', relationshipType: '' });
    };

    const otherPatients = patients.filter(p => p.id !== patient.id);
    const patientMap = new Map(patients.map(p => [p.id, `${p.firstName} ${p.lastName}`]));

    return (
        <Card>
            <CardHeader title="קשרי משפחה ומטופלים מקושרים" />
            <Divider />
            <CardContent>
                <Typography variant="h6" gutterBottom>הוספת קשר חדש</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid xs={12} sm={5}>
                            <TextField
                                select
                                fullWidth
                                name="relatedPatientId"
                                value={newRelationship.relatedPatientId}
                                onChange={handleInputChange}
                                label="בחר מטופל לקשר"
                                size="small"
                            >
                                {otherPatients.map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.id})</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid xs={12} sm={5}>
                             <TextField
                                fullWidth
                                name="relationshipType"
                                value={newRelationship.relationshipType}
                                onChange={handleInputChange}
                                label="סוג הקשר"
                                size="small"
                                helperText="לדוגמה: בן זוג, אמא, ילד"
                            />
                        </Grid>
                        <Grid xs={12} sm={2}>
                            <Button fullWidth variant="contained" onClick={handleAddClick}>הוסף קשר</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </CardContent>
            <Divider />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>שם המטופל המקושר</TableCell>
                            <TableCell>סוג הקשר</TableCell>
                            <TableCell align="right">פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patient.relationships && patient.relationships.length > 0 ? (
                            patient.relationships.map(rel => (
                                <TableRow key={rel.relatedPatientId}>
                                    <TableCell>{patientMap.get(rel.relatedPatientId) ?? 'לא ידוע'}</TableCell>
                                    <TableCell>{rel.relationshipType}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" color="error" onClick={() => removeRelationship(patient.id, rel.relatedPatientId)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">לא נמצאו קשרים.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};