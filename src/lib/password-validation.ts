/**
 * Password validation utilities with complexity requirements
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: "weak" | "fair" | "strong" | "very_strong";
}

const MIN_LENGTH = 12;
const MIN_LENGTH_LEGACY = 8; // For backwards compatibility warning

/**
 * Validate password against complexity requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Length check
  if (password.length < MIN_LENGTH) {
    if (password.length < MIN_LENGTH_LEGACY) {
      errors.push(`Password must be at least ${MIN_LENGTH_LEGACY} characters`);
    } else {
      errors.push(
        `Password should be at least ${MIN_LENGTH} characters for better security`
      );
    }
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push("Password should contain at least one uppercase letter");
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push("Password should contain at least one lowercase letter");
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push("Password should contain at least one number");
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password should contain at least one special character");
  }

  // Common password patterns (basic check)
  const commonPatterns = [
    /^password/i,
    /^123456/,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i,
    /^welcome/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    errors.push("Password is too common, please choose a more unique password");
  }

  // Calculate strength score
  let strengthScore = 0;
  if (password.length >= MIN_LENGTH) strengthScore++;
  if (password.length >= 16) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/[0-9]/.test(password)) strengthScore++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strengthScore++;

  let strength: PasswordValidationResult["strength"];
  if (strengthScore <= 2) strength = "weak";
  else if (strengthScore <= 4) strength = "fair";
  else if (strengthScore <= 5) strength = "strong";
  else strength = "very_strong";

  // Only require minimum length for validity (strict enforcement)
  // Other requirements are recommendations
  const valid = password.length >= MIN_LENGTH_LEGACY;

  return { valid, errors, strength };
}

/**
 * Get password requirements as a user-friendly string
 */
export function getPasswordRequirements(): string[] {
  return [
    `Minimum ${MIN_LENGTH} characters recommended (${MIN_LENGTH_LEGACY} required)`,
    "At least one uppercase letter (A-Z)",
    "At least one lowercase letter (a-z)",
    "At least one number (0-9)",
    "At least one special character (!@#$%^&*...)",
  ];
}
