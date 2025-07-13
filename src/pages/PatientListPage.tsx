import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Paper, TextField, InputAdornment, Alert, Snackbar } from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowId } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../services/supabaseClient';
import { Patient, PatientStatus } from '../types';
import { calculateAge } from '../utils/dateUtils';
import PatientFormModal from '../components/patient/PatientFormModal';

const PatientListPage: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [allPatients, setAllPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from('patients')
                .select(`id, national_id, first_name, last_name, date_of_birth, status`);
            
            if (dbError) throw dbError;

            const processedData: Patient[] = data.map(p => ({
                id: p.id,
                nationalId: p.national_id,
                firstName: p.first_name,
                lastName: p.last_name,
                dateOfBirth: p.date_of_birth,
                status: p.status as PatientStatus,
                age: calculateAge(p.date_of_birth),
                therapist: 'לא שויך'
            }));

            setAllPatients(processedData);
            setFilteredPatients(processedData);
        } catch (err: any) {
            setError('שגיאה בטעינת נתוני המטופלים. אנא נסה/י שוב מאוחר יותר.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    useEffect(() => {
        const lowercasedFilter = searchText.toLowerCase();
        const filteredData = allPatients.filter((item) => {
            const fullName = `${item.firstName} ${item.lastName}`;
            return (
                fullName.toLowerCase().includes(lowercasedFilter) ||
                item.nationalId.toLowerCase().includes(lowercasedFilter) ||
                item.therapist.toLowerCase().includes(lowercasedFilter) ||
                item.status.toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredPatients(filteredData);
    }, [searchText, allPatients]);

    const handleOpenModal = (patient: Patient | null) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null);
    };

    const handleSaveSuccess = (message: string) => {
        handleCloseModal();
        fetchPatients();
        setSnackbar({ open: true, message, severity: 'success' });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק מטופל זה? לא ניתן לשחזר פעולה זו.')) {
            // In a real app, a call to supabase.from('patients').delete().match({ id }) would be here.
            alert(`מטופל עם מזהה: ${id} נמחק (סימולציה).`);
        }
    };

    const columns: GridColDef<Patient>[] = [
        { field: 'id', headerName: 'מזהה', width: 80 },
        { field: 'nationalId', headerName: 'ת.ז.', width: 120 },
        { field: 'firstName', headerName: 'שם פרטי', width: 130 },
        { field: 'lastName', headerName: 'שם משפחה', width: 130 },
        { field: 'age', headerName: 'גיל', type: 'number', width: 80 },
        {
            field: 'status', headerName: 'סטטוס', width: 120,
            renderCell: (params) => {
                const statusColors: { [key in PatientStatus]: string } = {
                    'פעיל': 'success.main', 'לא פעיל': 'text.secondary',
                    'ממתין': 'warning.main', 'סיים טיפול': 'info.main'
                };
                return <Typography sx={{ color: statusColors[params.value] || 'default', fontWeight: 500 }}>{params.value}</Typography>;
            }
        },
        { field: 'therapist', headerName: 'מטפל/ת', width: 150 },
        {
            field: 'actions', type: 'actions', headerName: 'פעולות', width: 120, cellClassName: 'actions',
            getActions: ({ row }) => [
                <GridActionsCellItem icon={<VisibilityIcon />} label="View" onClick={() => handleOpenModal(row)} color="inherit" />,
                <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleOpenModal(row)} color="primary" />,
                <GridActionsCellItem icon={<DeleteIcon color="error" />} label="Delete" onClick={handleDeleteClick(row.id)} />,
            ],
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    ניהול מטופלים
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal(null)}>
                    הוסף מטופל חדש
                </Button>
            </Box>

            <Paper elevation={3} sx={{ height: 'calc(100vh - 220px)', width: '100%', borderRadius: '12px', p: 2 }}>
                 {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TextField
                        variant="outlined" placeholder="חפש לפי שם, ת.ז. ועוד..." size="small"
                        value={searchText} onChange={(e) => setSearchText(e.target.value)}
                        sx={{ width: '40%' }}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                        }}
                    />
                </Box>
                <DataGrid
                    rows={filteredPatients}
                    columns={columns}
                    initialState={{ pagination: { paginationModel: { page: 0, pageSize: 20 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    disableRowSelectionOnClick
                    sx={{ border: 'none', height: 'calc(100% - 56px)' }}
                    loading={loading}
                    localeText={{
                        noRowsLabel: 'לא נמצאו מטופלים',
                        footerTotalRows: 'סך הכל שורות:',
                    }}
                />
            </Paper>

            {isModalOpen && (
                <PatientFormModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    patient={selectedPatient}
                    onSave={handleSaveSuccess}
                />
            )}
            
            {snackbar && (
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default PatientListPage;