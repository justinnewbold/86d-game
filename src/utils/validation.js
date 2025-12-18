// ============================================
// INPUT VALIDATION UTILITIES
// ============================================

/**
 * Validate restaurant name
 * @param {string} name - The restaurant name to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRestaurantName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Name must be 30 characters or less' };
  }

  // Allow letters, numbers, spaces, and common punctuation
  const validPattern = /^[a-zA-Z0-9\s'&\-\.]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate capital amount
 * @param {number|string} amount - The capital amount to validate
 * @returns {{ valid: boolean, error?: string, value?: number }}
 */
export function validateCapital(amount) {
  const MIN_CAPITAL = 25000;
  const MAX_CAPITAL = 100000000; // $100M

  let numAmount;
  if (typeof amount === 'string') {
    // Remove currency symbols, commas, and whitespace
    const cleaned = amount.replace(/[$,\s]/g, '');

    // Handle shorthand notation (e.g., "1M", "500K")
    const shorthandMatch = cleaned.match(/^(\d+\.?\d*)(k|m|b)?$/i);
    if (shorthandMatch) {
      const [, num, unit] = shorthandMatch;
      const multipliers = { k: 1000, m: 1000000, b: 1000000000 };
      numAmount = parseFloat(num) * (multipliers[unit?.toLowerCase()] || 1);
    } else {
      numAmount = parseFloat(cleaned);
    }
  } else {
    numAmount = amount;
  }

  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return { valid: false, error: 'Please enter a valid number' };
  }

  if (numAmount < MIN_CAPITAL) {
    return { valid: false, error: `Minimum capital is $${MIN_CAPITAL.toLocaleString()}` };
  }

  if (numAmount > MAX_CAPITAL) {
    return { valid: false, error: `Maximum capital is $${MAX_CAPITAL.toLocaleString()}` };
  }

  return { valid: true, value: Math.round(numAmount) };
}

/**
 * Validate menu item price
 * @param {number} price - The price to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePrice(price) {
  if (typeof price !== 'number' || isNaN(price)) {
    return { valid: false, error: 'Price must be a number' };
  }

  if (price < 0) {
    return { valid: false, error: 'Price cannot be negative' };
  }

  if (price > 10000) {
    return { valid: false, error: 'Price seems unreasonably high' };
  }

  return { valid: true };
}

/**
 * Validate staff wage
 * @param {number} wage - The hourly wage to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateWage(wage) {
  const MIN_WAGE = 10;
  const MAX_WAGE = 200;

  if (typeof wage !== 'number' || isNaN(wage)) {
    return { valid: false, error: 'Wage must be a number' };
  }

  if (wage < MIN_WAGE) {
    return { valid: false, error: `Minimum wage is $${MIN_WAGE}/hr` };
  }

  if (wage > MAX_WAGE) {
    return { valid: false, error: `Maximum wage is $${MAX_WAGE}/hr` };
  }

  return { valid: true };
}

/**
 * Validate loan amount
 * @param {number} amount - The loan amount to validate
 * @param {number} maxDebt - Maximum allowed total debt
 * @param {number} currentDebt - Current total debt
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLoanAmount(amount, maxDebt, currentDebt) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Amount must be a number' };
  }

  if (amount <= 0) {
    return { valid: false, error: 'Loan amount must be positive' };
  }

  if (currentDebt + amount > maxDebt) {
    return { valid: false, error: `Loan would exceed max debt of $${maxDebt.toLocaleString()}` };
  }

  return { valid: true };
}

/**
 * Sanitize user input for display
 * @param {string} input - The input to sanitize
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Validate email format (for future multiplayer features)
 * @param {string} email - The email to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { valid: false, error: 'Please enter a valid email' };
  }

  return { valid: true };
}

export default {
  validateRestaurantName,
  validateCapital,
  validatePrice,
  validateWage,
  validateLoanAmount,
  sanitizeInput,
  validateEmail,
};
