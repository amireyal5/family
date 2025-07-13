import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid, CircularProgress, Alert, MenuItem, Box
} from '@mui/material';
import { supabase } from '../../services/supabaseClient';
import { validateIsraeliID } from '../../utils/validationUtils';
import { Patient, PatientStatus } from '../../types';

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (message: string) => void;
}

const statusOptions: PatientStatus[] = ['פעיל', 'לא פעיל', 'ממתין', 'סיים טיפול'];

const PatientFormModal: React.FC<PatientFormModalProps> = ({ open, onClose, patient, onSave }) => {
  const isEditMode = patient !== null;
  const [formData, setFormData] = useState({
    nationalId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    status: 'ממתין' as PatientStatus,
  });
  const [errors, setErrors] = useState({
    nationalId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && patient) {
      setFormData({
        nationalId: patient.nationalId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        status: patient.status,
      });
    } else {
       // Reset form for new patient
      setFormData({
        nationalId: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        status: 'ממתין',
      });
    }
    // Reset errors when modal opens or patient changes
    setErrors({ nationalId: '', firstName: '', lastName: '', dateOfBirth: '' });
    setServerError(null);
  }, [patient, open, isEditMode]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = (): boolean => {
    const newErrors = { nationalId: '', firstName: '', lastName: '', dateOfBirth: '' };
    let isValid = true;

    if (!formData.firstName.trim()) {
        newErrors.firstName = 'שם פרטי הוא שדה חובה';
        isValid = false;
    }
    if (!formData.lastName.trim()) {
        newErrors.lastName = 'שם משפחה הוא שדה חובה';
        isValid = false;
    }
    if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'תאריך לידה הוא שדה חובה';
        isValid = false;
    }
    if (!formData.nationalId.trim()) {
        newErrors.nationalId = 'תעודת זהות היא שדה חובה';
        isValid = false;
    } else if (!validateIsraeliID(formData.nationalId)) {
        newErrors.nationalId = 'תעודת זהות אינה תקינה';
        isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    setLoading(true);
    setServerError(null);

    try {
        // Check for uniqueness
        let query = supabase
            .from('patients')
            .select('id')
            .eq('national_id', formData.nationalId.trim());

        if (isEditMode && patient) {
            query = query.neq('id', patient.id);
        }

        const { data: existingPatient, error: checkError } = await query.maybeSingle();

        if (checkError) throw checkError;

        if (existingPatient) {
            setErrors(prev => ({ ...prev, nationalId: 'תעודת זהות זו כבר קיימת במערכת' }));
            setLoading(false);
            return;
        }

        const patientDataToSave = {
            national_id: formData.nationalId.trim(),
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            date_of_birth: formData.dateOfBirth,
            status: formData.status,
        };

        if (isEditMode && patient) {
            const { error: updateError } = await supabase
                .from('patients')
                .update(patientDataToSave)
                .eq('id', patient.id);
            if (updateError) throw updateError;
            onSave('פרטי המטופל עודכנו בהצלחה!');
        } else {
            const { error: insertError } = await supabase
                .from('patients')
                .insert(patientDataToSave);
            if (insertError) throw insertError;
            onSave('המטופל נוסף בהצלחה!');
        }
    } catch (err: any) {
        console.error("Error saving patient:", err);
        setServerError('אירעה שגיאה בשמירת פרטי המטופל. אנא נסה/י שוב.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'עריכת פרטי מטופל' : 'הוספת מטופל חדש'}</DialogTitle>
      <DialogContent>
        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="nationalId"
              label="תעודת זהות"
              value={formData.nationalId}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.nationalId}
              helperText={errors.nationalId}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="firstName"
              label="שם פרטי"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="lastName"
              label="שם משפחה"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="dateOfBirth"
              label="תאריך לידה"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="status"
              label="סטטוס"
              value={formData.status}
              onChange={handleChange}
              fullWidth
              select
              required
              disabled={loading}
            >
              {statusOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          ביטול
        </Button>
        <Box sx={{ position: 'relative' }}>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            שמירה
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PatientFormModal;
