/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Divider,
    TextField,
    Stack
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Patient, Therapist } from '../types';
import moment from 'moment';
import { useClinicStore } from '../store';

// --- Data Processing for Charts ---

const getPatientStatusData = (patients: Patient[], startDate: moment.Moment, endDate: moment.Moment) => {
    const relevantPatients = patients.filter(p => {
        const treatmentStart = moment(p.startDate);
        const treatmentEnd = p.endDate ? moment(p.endDate) : moment().endOf('day');
        return treatmentStart.isBefore(endDate) && treatmentEnd.isAfter(startDate);
    });

    const statusCounts = relevantPatients.reduce((acc, patient) => {
        acc[patient.status] = (acc[patient.status] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
};

const getPatientByCenterData = (patients: Patient[], startDate: moment.Moment, endDate: moment.Moment) => {
    const relevantPatients = patients.filter(p => {
        const treatmentStart = moment(p.startDate);
        return treatmentStart.isBetween(startDate, endDate, undefined, '[]');
    });

    const centerCounts = relevantPatients.reduce((acc, patient) => {
        const center = patient.therapeuticCenter || 'לא שויך';
        acc[center] = (acc[center] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    return Object.entries(centerCounts).map(([name, value]) => ({ name, value }));
}

const getRevenueByTherapistData = (patients: Patient[], therapists: Therapist[], startDate: moment.Moment, endDate: moment.Moment) => {
    const revenueMap = therapists.reduce((acc, therapist) => {
        acc[therapist.name] = 0;
        return acc;
    }, {} as {[key: string]: number});
    
    patients.forEach(patient => {
        if(patient.therapist && revenueMap.hasOwnProperty(patient.therapist)) {
            const totalPaidInPeriod = patient.transactions
              .filter(t => t.type === 'payment' && moment(t.date).isBetween(startDate, endDate, undefined, '[]'))
              .reduce((sum, p) => sum + p.amount, 0) || 0;
            revenueMap[patient.therapist] += totalPaidInPeriod;
        }
    });

    return Object.entries(revenueMap).map(([name, value]) => ({ name, 'הכנסה': value }));
};


const COLORS = ['#5850ec', '#1aae8d', '#f5a623', '#d32f2f', '#5a67d8', '#ff8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // Don't render label for small slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export const ReportsView: React.FC = () => {
    const { patients, therapists } = useClinicStore();
    const [dateRange, setDateRange] = useState({
        start: moment().subtract(1, 'year').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD'),
    });

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const startDate = useMemo(() => moment(dateRange.start).startOf('day'), [dateRange.start]);
    const endDate = useMemo(() => moment(dateRange.end).endOf('day'), [dateRange.end]);

    const patientStatusData = useMemo(() => getPatientStatusData(patients, startDate, endDate), [patients, startDate, endDate]);
    const patientByCenterData = useMemo(() => getPatientByCenterData(patients, startDate, endDate), [patients, startDate, endDate]);
    const revenueData = useMemo(() => getRevenueByTherapistData(patients, therapists, startDate, endDate), [patients, therapists, startDate, endDate]);
    
    return (
        <Box>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Grid>
                     <Typography variant="h4" sx={{ fontWeight: '700' }}>דוחות וניתוחים</Typography>
                </Grid>
                <Grid>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            name="start"
                            label="מתאריך"
                            type="date"
                            value={dateRange.start}
                            onChange={handleDateChange}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                         <TextField
                            name="end"
                            label="עד תאריך"
                            type="date"
                            value={dateRange.end}
                            onChange={handleDateChange}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                    </Stack>
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                {/* Patient Status Report */}
                <Grid xs={12} md={6} lg={6}>
                     <Card>
                        <CardHeader title="התפלגות מטופלים לפי סטטוס" />
                        <Divider />
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={patientStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {patientStatusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} מטופלים`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                     </Card>
                </Grid>
                 {/* Patient by Center Report */}
                <Grid xs={12} md={6} lg={6}>
                     <Card>
                        <CardHeader title="מטופלים חדשים לפי מרכז" />
                        <Divider />
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={patientByCenterData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {patientByCenterData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} מטופלים`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                     </Card>
                </Grid>
                {/* Revenue by Therapist Report */}
                 <Grid xs={12}>
                     <Card>
                        <CardHeader title="הכנסות מתשלומים לפי מטפל/ת" />
                        <Divider />
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                 <BarChart
                                    data={revenueData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(value) => `₪${value}`} />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip formatter={(value) => `₪${Number(value).toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="הכנסה" fill="var(--primary-color)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                     </Card>
                </Grid>
            </Grid>
        </Box>
    );
};