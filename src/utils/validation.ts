// ============================================
// INPUT VALIDATION UTILITIES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Restaurant name validation
export const validateRestaurantName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Restaurant name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Restaurant name must be at least 2 characters' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Restaurant name must be less than 50 characters' };
  }
  // Check for invalid characters (basic XSS prevention)
  const invalidChars = /[<>{}[\]]/;
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Restaurant name contains invalid characters' };
  }
  return { isValid: true };
};

// Capital amount validation
export const validateCapital = (amount: number): ValidationResult => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Capital must be a valid number' };
  }
  if (amount < 10000) {
    return { isValid: false, error: 'Minimum starting capital is $10,000' };
  }
  if (amount > 10000000) {
    return { isValid: false, error: 'Maximum starting capital is $10,000,000' };
  }
  return { isValid: true };
};

// Cuisine selection validation
export const validateCuisine = (cuisineId: string | null): ValidationResult => {
  if (!cuisineId) {
    return { isValid: false, error: 'Please select a cuisine type' };
  }
  return { isValid: true };
};

// Location type validation
export const validateLocationType = (locationId: string | null): ValidationResult => {
  if (!locationId) {
    return { isValid: false, error: 'Please select a location type' };
  }
  return { isValid: true };
};

// Staff wage validation
export const validateWage = (wage: number, minWage: number = 7.25): ValidationResult => {
  if (typeof wage !== 'number' || isNaN(wage)) {
    return { isValid: false, error: 'Wage must be a valid number' };
  }
  if (wage < minWage) {
    return { isValid: false, error: `Wage must be at least $${minWage}/hour` };
  }
  if (wage > 200) {
    return { isValid: false, error: 'Wage cannot exceed $200/hour' };
  }
  return { isValid: true };
};

// Menu item price validation
export const validateMenuPrice = (price: number): ValidationResult => {
  if (typeof price !== 'number' || isNaN(price)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }
  if (price < 0.01) {
    return { isValid: false, error: 'Price must be greater than $0' };
  }
  if (price > 10000) {
    return { isValid: false, error: 'Price cannot exceed $10,000' };
  }
  return { isValid: true };
};

// Loan amount validation
export const validateLoanAmount = (amount: number, maxAllowed: number): ValidationResult => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Loan amount must be a valid number' };
  }
  if (amount < 1000) {
    return { isValid: false, error: 'Minimum loan amount is $1,000' };
  }
  if (amount > maxAllowed) {
    return { isValid: false, error: `Maximum loan amount is $${maxAllowed.toLocaleString()}` };
  }
  return { isValid: true };
};

// Save game data validation
export interface SaveGameData {
  version?: string;
  slot: number;
  date: string;
  setup: unknown;
  game: unknown;
}

export const validateSaveGame = (data: unknown): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid save data format' };
  }

  const save = data as SaveGameData;

  if (typeof save.slot !== 'number') {
    return { isValid: false, error: 'Save slot must be a number' };
  }

  if (!save.date || typeof save.date !== 'string') {
    return { isValid: false, error: 'Save date is invalid' };
  }

  if (!save.setup || typeof save.setup !== 'object') {
    return { isValid: false, error: 'Save setup data is invalid' };
  }

  if (!save.game || typeof save.game !== 'object') {
    return { isValid: false, error: 'Save game data is invalid' };
  }

  return { isValid: true };
};

// Sanitize string input (prevent XSS)
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[{}[\]]/g, '') // Remove braces and brackets
    .trim();
};

// Validate positive integer
export const validatePositiveInteger = (value: number, fieldName: string = 'Value'): ValidationResult => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  if (!Number.isInteger(value)) {
    return { isValid: false, error: `${fieldName} must be a whole number` };
  }
  if (value < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }
  return { isValid: true };
};

// Validate percentage (0-100)
export const validatePercentage = (value: number, fieldName: string = 'Value'): ValidationResult => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  if (value < 0 || value > 100) {
    return { isValid: false, error: `${fieldName} must be between 0 and 100` };
  }
  return { isValid: true };
};

// Validate email (basic)
export const validateEmail = (email: string): ValidationResult => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
};
