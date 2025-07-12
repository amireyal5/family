/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Card,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Patient } from '../types';
import { PatientForm } from '../components/PatientForm';
import { PaymentsTab } from '../components/PaymentsTab';
import { TreatmentDetailsForm } from '../components/TreatmentDetailsForm';
import { ClinicalDocumentationTab } from '../components/ClinicalDocumentationTab';
import { FinancialManagementTab } from '../components/FinancialManagementTab';
import { FamilyConnectionsTab } from '../components/FamilyConnectionsTab';
import { PatientSummaryCard } from '../components/PatientSummaryCard';
import { useClinicStore } from '../store';
import { useUser } from '../context/UserContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: {xs: 2, md: 3} }}>
            {children}
        </Box>
      )}
    </div>
  );
}

interface PatientDetailViewProps {
    patient: Patient;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient }) => {
    const { setSelectedPatientId } = useClinicStore();
    const currentUser = useUser();
    const [tabIndex, setTabIndex] = React.useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };
    
    if (!currentUser) return null;

    const canViewClinicalData = currentUser.role === 'מנהל/ת' || currentUser.role === 'מטפל/ת';
    const canManageFinancials = currentUser.role === 'מנהל/ת' || currentUser.role === 'תחשיבנית';

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3}}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedPatientId(null)} variant="text" sx={{color: 'text.secondary'}}>
                    חזרה למטופלים
                </Button>
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: '700', mb: 3 }}>
                תיק מטופל: {patient.firstName} {patient.lastName}
            </Typography>


            <Grid container spacing={3}>
                <Grid xs={12} md={8} lg={9}>
                    <Card>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="patient detail tabs" variant="scrollable" scrollButtons="auto">
                                <Tab label="פרטים אישיים" />
                                <Tab label="פרטי טיפול" />
                                <Tab label="תנועות כספיות" />
                                <Tab label="קשרי משפחה" />
                                {canManageFinancials && <Tab label="ניהול פיננסי" />}
                                {canViewClinicalData && <Tab label="תיעוד קליני" />}
                            </Tabs>
                        </Box>
                        <TabPanel value={tabIndex} index={0}>
                            <PatientForm patient={patient} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={1}>
                            <TreatmentDetailsForm patient={patient} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={2}>
                            <PaymentsTab patient={patient} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={3}>
                            <FamilyConnectionsTab patient={patient} />
                        </TabPanel>
                        {canManageFinancials && (
                            <TabPanel value={tabIndex} index={4}>
                                <FinancialManagementTab patient={patient} />
                            </TabPanel>
                        )}
                        {canViewClinicalData && (
                            <TabPanel value={tabIndex} index={canManageFinancials ? 5 : 4}>
                                <ClinicalDocumentationTab patient={patient} />
                            </TabPanel>
                        )}
                    </Card>
                </Grid>
                <Grid xs={12} md={4} lg={3}>
                    <PatientSummaryCard patient={patient} />
                </Grid>
            </Grid>
        </Box>
    );
};