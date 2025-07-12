/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Patient, RateHistoryEntry, StatusHistoryEntry } from '../types';
import moment from 'moment';

/**
 * Gets the currently active rate for a patient based on a given date.
 * @param patient The patient object.
 * @param date The date for which to find the rate. Defaults to now.
 * @returns The active RateHistoryEntry or null if none is found.
 */
export const getCurrentRate = (patient: Patient, date: Date = new Date()): RateHistoryEntry | null => {
    if (!patient.rateHistory || patient.rateHistory.length === 0) {
        return null;
    }
    const sortedHistory = [...patient.rateHistory].sort((a, b) => moment(b.startDate).diff(moment(a.startDate)));
    const targetDate = moment(date);
    return sortedHistory.find(entry => targetDate.isSameOrAfter(moment(entry.startDate))) || null;
};

/**
 * Gets the active status for a patient on a given date.
 * @param patient The patient object.
 * @param date The date for which to find the status.
 * @returns The active StatusHistoryEntry or null.
 */
const getStatusOnDate = (patient: Patient, date: Date): StatusHistoryEntry | null => {
    if (!patient.statusHistory || patient.statusHistory.length === 0) {
        return null;
    }
     const sortedHistory = [...patient.statusHistory].sort((a, b) => moment(b.date).diff(moment(a.date)));
    const targetDate = moment(date);
    return sortedHistory.find(entry => targetDate.isSameOrAfter(moment(entry.date))) || null;
}


/**
 * Calculates the base charge for a patient, handling pro-rata rates, discounts, and frozen status.
 * Does NOT handle billing splits.
 * @param patient The patient to calculate charges for.
 * @returns The total base charge.
 */
const calculateBaseCharge = (patient: Patient): number => {
    if (!patient.startDate || patient.rateHistory.length === 0) {
        return 0;
    }

    let totalCharge = 0;
    const endStatuses: Patient['status'][] = ['סיום טיפול', 'הופסק', 'הסתיים בהצלחה'];
    const treatmentStart = moment(patient.startDate, 'YYYY-MM-DD');
    const treatmentEnd = (patient.endDate && endStatuses.includes(patient.status))
        ? moment(patient.endDate, 'YYYY-MM-DD')
        : moment();

    if (treatmentStart.isAfter(treatmentEnd)) {
        return 0;
    }

    let currentMonth = treatmentStart.clone().startOf('month');

    while (currentMonth.isSameOrBefore(treatmentEnd, 'month')) {
        let monthlyCharge = 0;
        const daysInMonth = currentMonth.daysInMonth();
        
        // Determine the range of days to charge for within this month
        const chargeStartDay = currentMonth.isSame(treatmentStart, 'month') ? treatmentStart.date() : 1;
        const chargeEndDay = currentMonth.isSame(treatmentEnd, 'month') ? treatmentEnd.date() : daysInMonth;

        for (let day = chargeStartDay; day <= chargeEndDay; day++) {
            const currentDate = currentMonth.clone().date(day);

            // Skip charge if patient status is 'מוקפא' (Frozen)
            const activeStatusEntry = getStatusOnDate(patient, currentDate.toDate());
            if (activeStatusEntry?.status === 'מוקפא') {
                continue;
            }
            
            const rateEntry = getCurrentRate(patient, currentDate.toDate());
            if (rateEntry && rateEntry.rate > 0) {
                const dailyRate = rateEntry.rate / daysInMonth;
                monthlyCharge += dailyRate;
            }
        }
        
        // Apply active discounts for the current month
        const activeDiscounts = patient.discounts?.filter(d => 
            d.status === 'מאושר' && 
            currentMonth.isBetween(moment(d.validFrom), moment(d.validUntil), 'month', '[]')
        ) || [];

        for (const discount of activeDiscounts) {
            if (discount.type === 'fixed_amount') {
                monthlyCharge = Math.max(0, monthlyCharge - discount.value);
            } else if (discount.type === 'percentage') {
                monthlyCharge *= (1 - (discount.value / 100));
            }
        }

        totalCharge += monthlyCharge;
        currentMonth.add(1, 'month');
    }

    return totalCharge;
};

interface FinancialSummary {
    totalCharged: number;
    totalPaid: number;
    balance: number;
}

/**
 * The main financial calculation function for a patient.
 * Handles pro-rata rates, discounts, billing splits, one-time charges, and refunds.
 * @param patient The primary patient.
 * @param allPatients The list of all patients to resolve billing splits.
 * @returns A FinancialSummary object.
 */
export const calculatePatientFinancials = (patient: Patient, allPatients: Patient[]): FinancialSummary => {
    // 1. Calculate the base monthly charge for the primary patient (pro-rata, discounts, and freezes applied)
    const patientBaseCharge = calculateBaseCharge(patient);
    
    // 2. Add any one-time charges
    const oneTimeCharges = patient.transactions
        .filter(t => t.type === 'charge')
        .reduce((sum, t) => sum + t.amount, 0);

    let finalCharge = patientBaseCharge + oneTimeCharges;

    // 3. Adjust charge based on this patient's own split settings
    if (patient.billingInfo?.splitWithPatientId && patient.billingInfo?.splitPercentage != null) {
        finalCharge = (patientBaseCharge * (patient.billingInfo.splitPercentage / 100)) + oneTimeCharges;
    }
    
    // 4. Find if another patient is splitting their bill with the current patient
    const primaryPayer = allPatients.find(p => 
        p.billingInfo?.splitWithPatientId === patient.id && 
        p.billingInfo?.splitPercentage != null
    );

    if (primaryPayer) {
        // Calculate the base charge of the person who initiated the split
        const primaryPayerBaseCharge = calculateBaseCharge(primaryPayer);
        // Calculate the share this patient owes from the primary payer's bill
        const shareFromPrimary = primaryPayerBaseCharge * ((100 - primaryPayer.billingInfo!.splitPercentage!) / 100);
        // Add this share to the current patient's final charge
        finalCharge += shareFromPrimary;
    }
    
    // 5. Calculate total paid (payments minus refunds)
    const totalPayments = patient.transactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRefunds = patient.transactions
        .filter(t => t.type === 'refund')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalPaid = totalPayments - totalRefunds;
    
    // Round final results to 2 decimal places to avoid floating point issues
    const roundedCharge = Math.round(finalCharge * 100) / 100;
    const roundedPaid = Math.round(totalPaid * 100) / 100;

    return {
        totalCharged: roundedCharge,
        totalPaid: roundedPaid,
        balance: roundedPaid - roundedCharge
    };
};