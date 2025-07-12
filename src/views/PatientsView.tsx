/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { Patient, Therapist, TherapeuticCenter, PatientStatus } from '../types';
import { PatientTable } from '../components/PatientTable';
import { AddPatientForm } from '../components/AddPatientForm';
import { useClinicStore } from '../store';

const patientStatuses: PatientStatus[] = ['בטיפול', 'בהמתנה לטיפול', 'הופסק', 'הסתיים בהצלחה', 'סיום טיפול', 'מוקפא'];
const therapeuticCenters: TherapeuticCenter[] = ['מרכז למשפחה', 'טיפול באלימות', 'מרכז להורות', 'לא שויך'];


export const PatientsView: React.FC = () => {
    const { patients, therapists, setSelectedPatientId, addPatient, setIsImporting } = useClinicStore();
    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [centerFilter, setCenterFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredPatients = useMemo(() => {
        return patients.filter(patient => {
            const searchMatch = (
                patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.id.includes(searchTerm)
            );
            const statusMatch = statusFilter === 'all' || patient.status === statusFilter;
            const centerMatch = centerFilter === 'all' || patient.therapeuticCenter === centerFilter;

            return searchMatch && statusMatch && centerMatch;
        });
    }, [patients, searchTerm, statusFilter, centerFilter]);

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: '700' }}>
                    ניהול מטופלים
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                     <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => setIsImporting(true)}
                    >
                        ייבוא נתונים
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setAddFormOpen(true)}
                    >
                        הוסף מטופל חדש
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                 <Grid xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="חיפוש לפי שם, משפחה או ת.ז..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>סינון לפי סטטוס</InputLabel>
                        <Select
                            value={statusFilter}
                            label="סינון לפי סטטוס"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">כל הסטטוסים</MenuItem>
                            {patientStatuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                 <Grid xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                        <InputLabel>סינון לפי מרכז</InputLabel>
                        <Select
                            value={centerFilter}
                            label="סינון לפי מרכז"
                            onChange={(e) => setCenterFilter(e.target.value)}
                        >
                            <MenuItem value="all">כל המרכזים</MenuItem>
                            {therapeuticCenters.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <PatientTable 
                patients={filteredPatients} 
                onRowClick={setSelectedPatientId}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
             />
            
            <AddPatientForm 
                open={isAddFormOpen}
                onClose={() => setAddFormOpen(false)}
                onSave={addPatient}
                patients={patients}
                therapists={therapists}
                therapeuticCenters={therapeuticCenters}
                patientStatuses={patientStatuses}
            />
        </>
    );
};