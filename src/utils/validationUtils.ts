/**
 * Validates an Israeli ID number using a variant of the Luhn algorithm.
 * @param id The ID number as a string. Can be up to 9 digits.
 * @returns True if the ID is valid, false otherwise.
 */
export const validateIsraeliID = (id: string): boolean => {
  if (!id || !/^\d{1,9}$/.test(id.trim())) {
    return false;
  }

  const strId = id.trim().padStart(9, '0');
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let digit = parseInt(strId[i], 10);
    // Multiply by 1 for odd positions (0-indexed i is even) and 2 for even positions
    let weight = (i % 2) + 1;
    let product = digit * weight;
    
    // If the product is a two-digit number, sum its digits
    if (product > 9) {
      product = (product % 10) + 1;
    }
    
    sum += product;
  }

  return sum % 10 === 0;
};
