/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
    Typography, List, ListItem, ListItemText, Checkbox, ListItemIcon, Divider, Box, Card, CardHeader, CardContent, Button
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { Patient } from '../types';
import moment from 'moment';
import { useClinicStore } from '../store';

const printStyles = `
  @media print {
    body, #root {
      visibility: hidden;
      background-color: white !important;
      height: auto !important;
      overflow: visible !important;
    }
    #print-section, #print-section * {
      visibility: visible;
    }
    #print-section {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      margin: 0;
      padding: 0;
      border: none !important;
      box-shadow: none !important;
    }
    .no-print {
      display: none !important;
    }
    @page {
      size: auto;
      margin: 1cm;
    }
    h4 { /* MUI typography variant for title */
        font-size: 18pt !important;
    }
    .MuiListItemText-primary {
        font-size: 14pt !important;
    }
     .MuiListItemText-secondary {
        font-size: 12pt !important;
    }
  }
`;


export const GuardView: React.FC = () => {
    const { appointments, patients, therapists, checkIn } = useClinicStore();
    
    const todayAppointments = appointments
        .filter(a => moment(a.start).isSame(new Date(), 'day'))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    const getPatient = (patientId?: string): Patient | undefined => {
        if (!patientId) return undefined;
        return patients.find(p => p.id === patientId);
    };

    const getTherapistName = (therapistId: string) => {
        const therapist = therapists.find(t => t.id === therapistId);
        return therapist ? therapist.name : "מטפל לא נמצא";
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style>{printStyles}</style>
                <Card sx={{ maxWidth: 900, margin: 'auto' }} id="print-section">
                    <CardHeader
                      title={`תוכנית יומית - ${moment().format('DD/MM/YYYY')}`}
                      subheader="רשימת המוזמנים להיום. יש לסמן מטופלים שהגיעו."
                      titleTypographyProps={{variant: 'h4', align: 'center', fontWeight: 700}}
                      subheaderTypographyProps={{variant: 'subtitle1', align: 'center', color: 'text.secondary'}}
                      sx={{pb: 1}}
                       action={
                          <Button
                              className="no-print"
                              variant="outlined"
                              startIcon={<PrintIcon />}
                              onClick={handlePrint}
                          >
                              הדפס
                          </Button>
                      }
                    />
                    <CardContent>
                        <List>
                            {todayAppointments.length > 0 ? todayAppointments.map((app, index) => {
                                const patient = getPatient(app.patientId);
                                const patientName = patient ? `${patient.firstName} ${patient.lastName}` : (app.title || "אירוע כללי");
                                
                                return (
                                <React.Fragment key={app.id}>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={app.checkedIn}
                                                onChange={(e) => checkIn(app.id, e.target.checked)}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {moment(app.start).format('HH:mm')} - {patientName}
                                                </Box>
                                            }
                                            secondary={`אצל: ${getTherapistName(app.therapistId)}`}
                                            sx={{textAlign: 'right'}}
                                        />
                                    </ListItem>
                                    {index < todayAppointments.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            )}) : (
                                <Typography sx={{textAlign: 'center', mt: 4}}>אין פגישות מתוכננות להיום.</Typography>
                            )}
                        </List>
                    </CardContent>
                </Card>
        </>
    );
};