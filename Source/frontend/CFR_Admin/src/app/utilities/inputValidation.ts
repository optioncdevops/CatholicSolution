/**
 * Input validation & sanitization (framework-agnostic).
 *
 * Standard: sanitize on change; validate business rules on blur/submit (RHF rules).
 */

export type InputValidationRule =
  | "numbersOnly"
  | "lettersOnly"
  | "alphanumericOnly"
  | "decimalOnly"
  | "mobileNumber"
  | "usPhoneNumber"
  | "pincodeNumber"
  | "email"
  | "password"
  | "lettersLimitedSpecial"
  | "lettersExtendedSpecial"
  | "lettersHyphenUnderscore"
  | "alphanumericWithDecimal"
  /** @deprecated Alias of `decimalOnly` — kept for backward compatibility */
  | "numericWithDecimal";

export interface SanitizeInputOptions {
  maxLength?: number;
  decimalPlaces?: number;
  maxBeforeDecimal?: number;
  /** Reject / clamp decimal input when numeric value exceeds this (e.g. 100 for %). */
  maxValue?: number;
}

export const INPUT_REGEX = {
  lettersOnly: /[^a-zA-Z\s]/g,
  numbersOnly: /[^0-9]/g,
  alphanumericOnly: /[^a-zA-Z0-9\s]/g,
  lettersLimitedSpecial: /[^a-zA-Z0-9\s\-&./]/g,
  lettersExtendedSpecial: /[^a-zA-Z0-9\s/@#%*&().,_-]/g,
  lettersHyphenUnderscore: /[^a-zA-Z0-9\s\-_&/]/g,
  alphanumericWithDecimal: /[^a-zA-Z0-9.]/g,
  emailAllowedChars: /[^a-zA-Z0-9._%+@-]/g,
  passwordAllowedChars: /[^a-zA-Z0-9!@#$%&]/g,
} as const;

const DEFAULT_EMAIL_MAX_LENGTH = 100;
const DEFAULT_PASSWORD_MAX_LENGTH = 20;
const DEFAULT_MOBILE_LENGTH = 10;
/** Display length: 10 digits + space (98765 43210). */
export const INDIAN_MOBILE_MASKED_MAX_LENGTH = 11;

/** Pattern-style placeholder for Indian mobile fields. */
export const INDIAN_MOBILE_MASK_PLACEHOLDER = "XXXXX XXXXX";

/** Indian pincode: 6 digits displayed as `XXX XXX`. */
export const INDIAN_PINCODE_DIGIT_LENGTH = 6;
/** Display length: 6 digits + 1 space. */
export const INDIAN_PINCODE_MASKED_MAX_LENGTH = 7;
/** Pattern-style placeholder for pincode fields. */
export const INDIAN_PINCODE_MASK_PLACEHOLDER = "XXX XXX";

const DEFAULT_DECIMAL_PLACES = 2;

function collapseSpaces(value: string): string {
  return value.replace(/ {2,}/g, " ");
}

function trimLeadingSpaces(value: string): string {
  return value.replace(/^\s+/, "");
}

function collapseRepeated(value: string, char: string): string {
  const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return value.replace(new RegExp(`${escaped}{2,}`, "g"), char);
}

function applyMaxLength(value: string, maxLength?: number): string {
  if (maxLength == null || maxLength < 0) {return value;}
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function sanitizeWithRegex(
  value: string,
  regex: RegExp,
  options?: { collapseChars?: string[]; trimLeading?: boolean },
): string {
  let result = value.replace(regex, "");
  if (options?.trimLeading) {
    result = trimLeadingSpaces(result);
  }
  result = collapseSpaces(result);
  if (options?.collapseChars) {
    for (const char of options.collapseChars) {
      result = collapseRepeated(result, char);
    }
  }
  return result;
}

/** Keeps digits and a single decimal point; preserves partial values like `12.` */
export function sanitizeDecimalInput(
  value: string,
  decimalPlaces = DEFAULT_DECIMAL_PLACES,
  maxBeforeDecimal?: number,
  maxValue?: number,
): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  let result: string;
  if (firstDot === -1) {
    if (maxBeforeDecimal != null) {
      result = cleaned.slice(0, maxBeforeDecimal);
    } else {
      result = cleaned;
    }
  } else {
    let integerPart = cleaned.slice(0, firstDot);
    if (maxBeforeDecimal != null && integerPart.length > maxBeforeDecimal) {
      integerPart = integerPart.slice(0, maxBeforeDecimal);
    }

    const fractionalRaw = cleaned.slice(firstDot + 1).replace(/\./g, "");
    const decimalPart = fractionalRaw.slice(0, decimalPlaces);

    if (cleaned.endsWith(".") && fractionalRaw.length === 0) {
      result = `${integerPart}.`;
    } else {
      result = decimalPart.length > 0 ? `${integerPart}.${decimalPart}` : integerPart;
    }
  }

  return applyDecimalMaxValue(result, maxValue);
}

function applyDecimalMaxValue(result: string, maxValue?: number): string {
  if (maxValue == null || result === "" || result === ".") {
    return result;
  }
  const endsWithDot = result.endsWith(".");
  const numericSource = endsWithDot ? result.slice(0, -1) : result;
  if (numericSource === "") {
    return result;
  }
  const num = Number(numericSource);
  if (!Number.isFinite(num) || num <= maxValue) {
    return result;
  }
  return String(maxValue);
}

/** Removes all whitespace from a mobile display value (e.g. mask `98765 43210`). */
export function stripMobileNumberSpaces(value: string): string {
  return String(value ?? "").replace(/\s/g, "");
}

/** Mobile values may contain digits and spaces only (mask spacing while typing). */
export function hasOnlyMobileSafeCharacters(value: string): boolean {
  return /^[0-9\s]*$/.test(String(value ?? ""));
}

/**
 * Strips non-digits and common Indian prefixes (+91 / 91 / leading 0) from pasted input.
 */
export const normalizeIndianMobileDigits = (
  value: string,
  maxLength = DEFAULT_MOBILE_LENGTH,
): string => {
  let digits = value.replace(INPUT_REGEX.numbersOnly, "");

  if (digits.length > maxLength && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length > maxLength && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, maxLength);
};

/** Formats 10 digits as Indian display mask: `98765 43210`. */
export function formatIndianMobileMask(
  digits: string,
  digitLength = DEFAULT_MOBILE_LENGTH,
): string {
  const normalized = digits.replace(INPUT_REGEX.numbersOnly, "").slice(0, digitLength);
  if (normalized.length <= 5) {return normalized;}
  return `${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}

/** Sanitize + apply Indian mobile display mask while typing/pasting. */
export const sanitizeMobileNumberInput = (
  value: string,
  maxLength = DEFAULT_MOBILE_LENGTH,
): string => {
  const digits = normalizeIndianMobileDigits(value, maxLength);
  return formatIndianMobileMask(digits, maxLength);
};

const US_PHONE_DIGIT_LENGTH = 10;
/** Display length: `(XXX) XXX-XXXX`. */
export const US_PHONE_MASKED_MAX_LENGTH = 14;
/** Pattern-style placeholder for US phone fields. */
export const US_PHONE_MASK_PLACEHOLDER = "(XXX) XXX-XXXX";

/** Removes everything but digits from a US phone display value (e.g. mask `(555) 123-4567`). */
export function stripUsPhoneNonDigits(value: string): string {
  return String(value ?? "").replace(/\D/g, "");
}

/** Strips non-digits and a leading US country-code "1" (when present alongside a full 10-digit number). */
export const normalizeUsPhoneDigits = (
  value: string,
  maxLength = US_PHONE_DIGIT_LENGTH,
): string => {
  let digits = value.replace(INPUT_REGEX.numbersOnly, "");
  if (digits.length > maxLength && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, maxLength);
};

/** Formats up to 10 digits as a US phone display mask, progressively while typing: `(555) 123-4567`. */
export function formatUsPhoneMask(
  digits: string,
  digitLength = US_PHONE_DIGIT_LENGTH,
): string {
  const normalized = normalizeUsPhoneDigits(digits, digitLength);
  const len = normalized.length;
  if (len === 0) {return "";}
  if (len < 4) {return `(${normalized}`;}
  if (len < 7) {return `(${normalized.slice(0, 3)}) ${normalized.slice(3)}`;}
  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

/** Sanitize + apply US phone display mask while typing/pasting. */
export const sanitizeUsPhoneInput = (
  value: string,
  maxLength = US_PHONE_DIGIT_LENGTH,
): string => {
  const digits = normalizeUsPhoneDigits(value, maxLength);
  return formatUsPhoneMask(digits, maxLength);
};

/** True only for a real 10-digit US number — a string of only symbols/parentheses does not pass. */
export const isValidUsPhoneNumber = (
  value: string,
  length = US_PHONE_DIGIT_LENGTH,
): boolean => {
  const raw = String(value ?? "");
  if (!raw.trim()) {return false;}
  const digits = stripUsPhoneNonDigits(raw);
  return digits.length === length;
};

/** Removes all whitespace from a pincode display value (e.g. mask `400 001`). */
export function stripPincodeSpaces(value: string): string {
  return String(value ?? "").replace(/\s/g, "");
}

/** Formats 6 digits as pincode display mask: `400 001`. */
export function formatPincodeMask(digits: string): string {
  const normalized = digits.replace(/[^0-9]/g, "").slice(0, INDIAN_PINCODE_DIGIT_LENGTH);
  if (normalized.length <= 3) { return normalized; }
  return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
}

/** Sanitize + apply pincode display mask while typing/pasting. */
export function sanitizePincodeInput(value: string): string {
  return formatPincodeMask(value);
}

export const isValidPincode = (value: string): boolean => {
  const raw = String(value ?? "");
  if (!raw.trim()) { return false; }
  const digits = stripPincodeSpaces(raw);
  return /^\d{6}$/.test(digits);
};

export const isValidMobileNumber = (
  value: string,
  length = DEFAULT_MOBILE_LENGTH,
  enforceIndianStart = true,
): boolean => {
  const raw = String(value ?? "");
  if (!raw.trim()) {return false;}

  if (!hasOnlyMobileSafeCharacters(raw)) {return false;}

  const digits = stripMobileNumberSpaces(raw);
  if (!/^\d+$/.test(digits)) {return false;}
  if (digits.length !== length) {return false;}

  if (enforceIndianStart) {
    return new RegExp(`^[6-9][0-9]{${length - 1}}$`).test(digits);
  }
  return true;
};

export function sanitizeEmailInput(
  value: string,
  maxLength = DEFAULT_EMAIL_MAX_LENGTH,
): string {
  return applyMaxLength(
    value
      .replace(/\s+/g, "")
      .replace(INPUT_REGEX.emailAllowedChars, "")
      .replace(/@{2,}/g, "@"),
    maxLength,
  );
}

export function sanitizePasswordInput(
  value: string,
  maxLength = DEFAULT_PASSWORD_MAX_LENGTH,
): string {
  return applyMaxLength(
    value.replace(/\s+/g, "").replace(INPUT_REGEX.passwordAllowedChars, ""),
    maxLength,
  );
}

export function sanitizeInputValue(
  value: string,
  rule?: InputValidationRule,
  options: SanitizeInputOptions = {},
): string {
  if (!rule) {
    return applyMaxLength(value, options.maxLength);
  }

  const decimalPlaces = options.decimalPlaces ?? DEFAULT_DECIMAL_PLACES;
  let result: string;

  switch (rule) {
    case "lettersOnly":
      result = sanitizeWithRegex(value, INPUT_REGEX.lettersOnly, {
        trimLeading: true,
      });
      break;
    case "numbersOnly":
      result = value.replace(INPUT_REGEX.numbersOnly, "");
      break;
    case "mobileNumber":
      // Digit cap is always 10; `maxLength` on the input is display width (incl. space).
      result = sanitizeMobileNumberInput(value, DEFAULT_MOBILE_LENGTH);
      break;
    case "usPhoneNumber":
      result = sanitizeUsPhoneInput(value, US_PHONE_DIGIT_LENGTH);
      break;
    case "pincodeNumber":
      result = sanitizePincodeInput(value);
      break;
    case "decimalOnly":
    case "numericWithDecimal":
      result = sanitizeDecimalInput(
        value,
        decimalPlaces,
        options.maxBeforeDecimal,
        options.maxValue,
      );
      break;
    case "alphanumericOnly":
      result = sanitizeWithRegex(value, INPUT_REGEX.alphanumericOnly, {
        trimLeading: true,
      });
      break;
    case "lettersLimitedSpecial":
      result = sanitizeWithRegex(value, INPUT_REGEX.lettersLimitedSpecial, {
        trimLeading: true,
        collapseChars: ["-", "&", ".", "/"],
      });
      break;
    case "lettersExtendedSpecial":
      result = sanitizeWithRegex(value, INPUT_REGEX.lettersExtendedSpecial, {
        trimLeading: true,
        collapseChars: ["-", "&", ".", "/", "@", "#"],
      });
      break;
    case "lettersHyphenUnderscore":
      result = sanitizeWithRegex(value, INPUT_REGEX.lettersHyphenUnderscore, {
        trimLeading: true,
        collapseChars: ["-", "_", "&", "/"],
      });
      break;
    case "alphanumericWithDecimal":
      result = value.replace(INPUT_REGEX.alphanumericWithDecimal, "");
      result = collapseRepeated(result, ".");
      break;
    case "email":
      result = sanitizeEmailInput(value, options.maxLength ?? DEFAULT_EMAIL_MAX_LENGTH);
      break;
    case "password":
      result = sanitizePasswordInput(
        value,
        options.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH,
      );
      break;
    default:
      result = value;
  }

  if (rule !== "mobileNumber" && rule !== "usPhoneNumber" && rule !== "pincodeNumber" && rule !== "email" && rule !== "password") {
    result = applyMaxLength(result, options.maxLength);
  }

  return result;
}

const VALIDATION_PATTERNS: Partial<Record<InputValidationRule, RegExp>> = {
  lettersOnly: /^[a-zA-Z\s]*$/,
  numbersOnly: /^[0-9]*$/,
  mobileNumber: /^[0-9 ]*$/,
  usPhoneNumber: /^[0-9()\- ]*$/,
  decimalOnly: /^\d*\.?\d*$/,
  numericWithDecimal: /^\d*\.?\d*$/,
  alphanumericOnly: /^[a-zA-Z0-9\s]*$/,
  lettersLimitedSpecial: /^[a-zA-Z0-9\s\-&./]*$/,
  lettersExtendedSpecial: /^[a-zA-Z0-9\s/@#%*&().,_-]*$/,
  lettersHyphenUnderscore: /^[a-zA-Z0-9\s\-_&/]*$/,
  alphanumericWithDecimal: /^[a-zA-Z0-9.]*$/,
  email: /^[a-zA-Z0-9._%+@-]*$/,
  password: /^[a-zA-Z0-9!@#$%&]*$/,
};

export function isValidInputValue(
  value: string,
  rule?: InputValidationRule,
  options: SanitizeInputOptions = {},
): boolean {
  if (!rule) {return true;}

  const sanitized = sanitizeInputValue(value, rule, options);
  if (sanitized !== value) {return false;}

  if (rule === "mobileNumber") {
    if (!hasOnlyMobileSafeCharacters(value)) {return false;}
    const digits = stripMobileNumberSpaces(value);
    return (
      digits.length <= DEFAULT_MOBILE_LENGTH &&
      (value === formatIndianMobileMask(digits, DEFAULT_MOBILE_LENGTH) ||
        value === digits)
    );
  }

  if (rule === "usPhoneNumber") {
    const digits = stripUsPhoneNonDigits(value);
    return digits.length <= US_PHONE_DIGIT_LENGTH && value === formatUsPhoneMask(digits, US_PHONE_DIGIT_LENGTH);
  }

  if (rule === "pincodeNumber") {
    const digits = stripPincodeSpaces(value);
    return (
      /^[0-9\s]*$/.test(value) &&
      digits.length <= INDIAN_PINCODE_DIGIT_LENGTH &&
      (value === formatPincodeMask(digits) || value === digits)
    );
  }

  const pattern = VALIDATION_PATTERNS[rule];
  if (!pattern) {return true;}
  return pattern.test(value);
}

const EMAIL_FORMAT_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_FORMAT_REGEX.test(value.trim());
}

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasMaxLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;
}

export function validatePasswordStrength(
  password: string,
): PasswordValidationResult {
  const result: PasswordValidationResult = {
    isValid: false,
    hasMinLength: password.length >= 8,
    hasMaxLength: password.length <= DEFAULT_PASSWORD_MAX_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialCharacter: /[!@#$%&]/.test(password),
  };

  result.isValid =
    result.hasMinLength &&
    result.hasMaxLength &&
    result.hasUppercase &&
    result.hasLowercase &&
    result.hasNumber &&
    result.hasSpecialCharacter;

  return result;
}

export function isPasswordStrong(password: string): boolean {
  return validatePasswordStrength(password).isValid;
}
/* -------------------------------------------------------------------------- */
/* Unit conversion (length & weight)                                            */
/* -------------------------------------------------------------------------- */

/** Default decimal precision for mm/m and kg/MT conversions. */
export const DEFAULT_UNIT_CONVERSION_DECIMAL_PLACES = 3;

const MM_PER_M = 1000;
const KG_PER_MT = 1000;

export interface UnitConversionOptions {
  /** Digits allowed after the decimal point. Defaults to {@link DEFAULT_UNIT_CONVERSION_DECIMAL_PLACES}. */
  decimalPlaces?: number;
}

function resolveUnitConversionDecimalPlaces(
  options?: UnitConversionOptions,
): number {
  const places = options?.decimalPlaces ?? DEFAULT_UNIT_CONVERSION_DECIMAL_PLACES;
  if (!Number.isFinite(places) || places < 0) {
    return DEFAULT_UNIT_CONVERSION_DECIMAL_PLACES;
  }
  return Math.min(Math.trunc(places), 20);
}

function roundUnitConversion(value: number, decimalPlaces: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

function parseConversionNumber(
  value: number | string | null | undefined,
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value.trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Converts millimetres to metres. Result is rounded to the configured decimal places (default 3). */
export function mmToM(
  mm: number | string | null | undefined,
  options?: UnitConversionOptions,
): number {
  const decimalPlaces = resolveUnitConversionDecimalPlaces(options);
  return roundUnitConversion(parseConversionNumber(mm) / MM_PER_M, decimalPlaces);
}

/** Converts metres to millimetres. Result is rounded to the configured decimal places (default 3). */
export function mToMm(
  m: number | string | null | undefined,
  options?: UnitConversionOptions,
): number {
  const decimalPlaces = resolveUnitConversionDecimalPlaces(options);
  return roundUnitConversion(parseConversionNumber(m) * MM_PER_M, decimalPlaces);
}

/** Converts kilograms to metric tonnes (MT). Result is rounded to the configured decimal places (default 3). */
export function kgToMt(
  kg: number | string | null | undefined,
  options?: UnitConversionOptions,
): number {
  const decimalPlaces = resolveUnitConversionDecimalPlaces(options);
  return roundUnitConversion(parseConversionNumber(kg) / KG_PER_MT, decimalPlaces);
}

/** Converts metric tonnes (MT) to kilograms. Result is rounded to the configured decimal places (default 3). */
export function mtToKg(
  mt: number | string | null | undefined,
  options?: UnitConversionOptions,
): number {
  const decimalPlaces = resolveUnitConversionDecimalPlaces(options);
  return roundUnitConversion(parseConversionNumber(mt) * KG_PER_MT, decimalPlaces);
}