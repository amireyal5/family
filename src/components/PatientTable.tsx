

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TableSortLabel,
  Box,
  TablePagination
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Patient } from '../types';
import { getCurrentRate } from '../utils/financials';

function getStatusChipColor(status: Patient['status']) {
    switch (status) {
        case 'בטיפול':
            return 'success';
        case 'בהמתנה לטיפול':
            return 'warning';
        case 'הסתיים בהצלחה':
            return 'info';
        case 'הופסק':
        case 'סיום טיפול':
            return 'default';
        default:
            return 'primary';
    }
}

const formatDateForDisplay = (dateString: string | undefined | null): string => {
    if (!dateString) return '-';
    // Assumes dateString is in 'YYYY-MM-DD' format
    try {
        const date = new Date(dateString);
        // Add time zone offset to prevent day-before issue
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const correctedDate = new Date(date.getTime() + userTimezoneOffset);
        
        const day = String(correctedDate.getDate()).padStart(2, '0');
        const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
        const year = correctedDate.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        // Fallback for unexpected formats
        return dateString;
    }
};

interface PatientTableProps {
    patients: Patient[];
    onRowClick: (patientId: string) => void;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type Order = 'asc' | 'desc';
type OrderableHeadCells = keyof Patient | 'monthlyRate';

const headCells: { id: OrderableHeadCells; label: string; numeric: boolean }[] = [
    { id: 'firstName', numeric: false, label: 'שם מלא' },
    { id: 'id', numeric: false, label: 'תעודת זהות' },
    { id: 'therapeuticCenter', numeric: false, label: 'מרכז טיפולי'},
    { id: 'therapist', numeric: false, label: 'שם המטפל/ת' },
    { id: 'treatmentType', numeric: false, label: 'סוג הטיפול' },
    { id: 'startDate', numeric: false, label: 'תאריך תחילת טיפול' },
    { id: 'monthlyRate', numeric: true, label: 'תעריף חודשי' },
    { id: 'paymentTier', numeric: true, label: 'דרגת תשלום' },
    { id: 'status', numeric: false, label: 'סטטוס טיפול' },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(
  order: Order,
  orderBy: keyof Patient,
): (
  a: { [key in keyof Patient]: any },
  b: { [key in keyof Patient]: any },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const PatientTable: React.FC<PatientTableProps> = ({ patients, onRowClick, page, rowsPerPage, onPageChange, onRowsPerPageChange }) => {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<OrderableHeadCells>('lastName');

  const handleRequestSort = (property: OrderableHeadCells) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const sortedPatients = React.useMemo(() => {
    if (orderBy === 'monthlyRate') {
      return [...patients].sort((a, b) => {
        const rateA = getCurrentRate(a)?.rate || 0;
        const rateB = getCurrentRate(b)?.rate || 0;
        return order === 'asc' ? rateA - rateB : rateB - rateA;
      });
    } else {
        return [...patients].sort(getComparator(order, orderBy as keyof Patient));
    }
  }, [order, orderBy, patients]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow sx={{
                '& .MuiTableCell-head': {
                    bgcolor: 'background.default',
                }
            }}>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={'right'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id === 'firstName' ? 'lastName' : headCell.id)}
                  >
                    {headCell.label}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((patient) => {
              const currentRate = getCurrentRate(patient)?.rate ?? 0;
              return (
                <TableRow 
                  hover 
                  onClick={() => onRowClick(patient.id)}
                  tabIndex={-1} 
                  key={patient.id}
                  sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="right">{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell align="right">{patient.id}</TableCell>
                  <TableCell align="right">{patient.therapeuticCenter}</TableCell>
                  <TableCell align="right">{patient.therapist || 'טרם שויך'}</TableCell>
                  <TableCell align="right">{patient.treatmentType || 'טרם נקבע'}</TableCell>
                  <TableCell align="right">{formatDateForDisplay(patient.startDate)}</TableCell>
                  <TableCell align="right">₪{currentRate.toLocaleString()}</TableCell>
                  <TableCell align="right">{patient.paymentTier}</TableCell>
                  <TableCell align="right">
                      <Chip label={patient.status} color={getStatusChipColor(patient.status)} size="small" variant="filled"/>
                  </TableCell>
                </TableRow>
              )
            })}
           </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={patients.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="שורות בעמוד:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
      />
    </Paper>
  );
};