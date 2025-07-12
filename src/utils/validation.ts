/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validates an Israeli ID number (Teudat Zehut).
 * @param id The ID number as a string.
 * @returns True if the ID is valid, false otherwise.
 */
export function isValidIsraeliID(id: string): boolean {
  if (!id || typeof id !== 'string' || !/^\d{9}$/.test(id)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(id[i], 10);
    if (i % 2 === 1) { // For digits at odd indices (2nd, 4th, etc.)
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}
