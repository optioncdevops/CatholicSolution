export const STATE_CODE_NAMES = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CG: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OD: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TS: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  WB: "West Bengal",
  AN: "Andaman & Nicobar Islands",
  CH: "Chandigarh",
  DH: "Dadra & Nagar Haveli and Daman & Diu",
  DL: "Delhi (NCT)",
  JK: "Jammu & Kashmir",
  LA: "Ladakh",
  LD: "Lakshadweep",
  PY: "Puducherry",
} as const;

export const INDIAN_STATE_CODES = Object.keys(STATE_CODE_NAMES) as (keyof typeof STATE_CODE_NAMES)[];

export type StateCode = keyof typeof STATE_CODE_NAMES;
export type VehicleNumberType = "state-series" | "bharat-series";

export interface VehicleValidationResult {
  isValid: boolean;
  type?: VehicleNumberType;
  normalized: string;
  compact: string;
  formatted: string;
  stateCode?: string;
  stateName?: string;
  error?: string;
}

/** Indian state series: SS DD LL DDDD e.g. TN 01 AJ 0001 */
const STATE_SERIES_REGEX = /^([A-Z]{2})(\d{2})([A-Z]{2})(\d{4})$/;
/** Bharat series: YY BH DDDD LL e.g. 26 BH 4587 AK */
const BH_SERIES_REGEX = /^(\d{2})BH(\d{4})([A-Z]{2})$/;

export function normalizeVehicleNumber(value: string | null | undefined): string {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function getStateName(stateCode: string | null | undefined): string | undefined {
  const code = String(stateCode ?? "").toUpperCase();
  if (code === "BH") {
    return "Bharat Series";
  }
  return STATE_CODE_NAMES[code as StateCode];
}

export function isKnownIndianStateCode(code: string | null | undefined): boolean {
  const compact = String(code ?? "").toUpperCase();
  return (INDIAN_STATE_CODES as string[]).includes(compact);
}

/** True if `prefix` can still become a valid 2-letter state code. */
export function isValidStateCodePrefix(prefix: string | null | undefined): boolean {
  const p = String(prefix ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  if (!p) {
    return true;
  }
  if (p.length > 2) {
    return false;
  }
  return (INDIAN_STATE_CODES as string[]).some((code) => code.startsWith(p));
}

function parseStateRest(rest: string): { rto: string; series: string; number: string } {
  let rto = "";
  let series = "";
  let number = "";
  let phase: "rto" | "series" | "number" = "rto";

  for (const ch of rest) {
    if (phase === "rto") {
      if (/\d/.test(ch) && rto.length < 2) {
        rto += ch;
        if (rto.length === 2) {
          phase = "series";
        }
      }
    } else if (phase === "series") {
      if (/[A-Z]/.test(ch) && series.length < 2) {
        series += ch;
      } else if (/\d/.test(ch) && series.length === 2 && number.length < 4) {
        phase = "number";
        number += ch;
      }
    } else if (/\d/.test(ch) && number.length < 4) {
      number += ch;
    }
  }

  return { rto, series, number };
}

function formatCompactVehicleNumber(compact: string, type?: VehicleNumberType): string {
  if (!compact) {
    return "";
  }
  if (type === "bharat-series") {
    const yy = compact.slice(0, 2);
    const bh = compact.slice(2, 4);
    const digits = compact.slice(4, 8);
    const letters = compact.slice(8, 10);
    return [yy, bh, digits, letters].filter(Boolean).join(" ");
  }

  const state = compact.slice(0, 2);
  const { rto, series, number } = parseStateRest(compact.slice(2));
  return [state, rto, series, number].filter(Boolean).join(" ");
}

export function detectIndianVehicleType(
  value: string | null | undefined,
): VehicleNumberType | undefined {
  const compact = normalizeVehicleNumber(value);
  if (!compact) {
    return undefined;
  }
  // Digit-first → Bharat series (e.g. 26 BH 4587 AK)
  if (/^\d/.test(compact)) {
    return "bharat-series";
  }
  // Letter-first → normal state series (e.g. TN 01 AJ 0001)
  if (/^[A-Z]/.test(compact)) {
    return "state-series";
  }
  return undefined;
}

export function validateVehicleNumber(value: string | null | undefined): VehicleValidationResult {
  const compact = normalizeVehicleNumber(value);
  if (!compact) {
    return {
      isValid: false,
      normalized: "",
      compact: "",
      formatted: "",
      error: "Vehicle number is required.",
    };
  }

  const bhMatch = BH_SERIES_REGEX.exec(compact);
  if (bhMatch) {
    return {
      isValid: true,
      type: "bharat-series",
      normalized: compact,
      compact,
      formatted: formatCompactVehicleNumber(compact, "bharat-series"),
      stateCode: "BH",
      stateName: "Bharat Series",
    };
  }

  const stateMatch = STATE_SERIES_REGEX.exec(compact);
  if (!stateMatch) {
    const typed = detectIndianVehicleType(compact);
    if (typed === "bharat-series") {
      return {
        isValid: false,
        type: "bharat-series",
        normalized: compact,
        compact,
        formatted: formatCompactVehicleNumber(compact, "bharat-series"),
        error: "Enter Bharat series as YY BH #### XX (e.g. 26 BH 4587 AK).",
      };
    }
    const prefix = compact.slice(0, 2);
    if (prefix.length === 2 && /^[A-Z]{2}$/.test(prefix) && !isKnownIndianStateCode(prefix)) {
      return {
        isValid: false,
        type: "state-series",
        normalized: compact,
        compact,
        formatted: formatCompactVehicleNumber(compact),
        stateCode: prefix,
        error: "Invalid state code. Use a valid Indian state / UT code.",
      };
    }
    return {
      isValid: false,
      type: typed,
      normalized: compact,
      compact,
      formatted: formatCompactVehicleNumber(compact, typed),
      error: "Vehicle number format is invalid. Use TN 01 AJ 0001 or 26 BH 4587 AK.",
    };
  }

  const stateCode = stateMatch[1] as StateCode;
  const stateName = STATE_CODE_NAMES[stateCode];
  if (!stateName) {
    return {
      isValid: false,
      type: "state-series",
      normalized: compact,
      compact,
      formatted: formatCompactVehicleNumber(compact),
      stateCode,
      error: "Invalid state code. Use a valid Indian state / UT code.",
    };
  }

  return {
    isValid: true,
    type: "state-series",
    normalized: compact,
    compact,
    formatted: formatCompactVehicleNumber(compact, "state-series"),
    stateCode,
    stateName,
  };
}

export function isValidVehicleNumber(value: string | null | undefined): boolean {
  return validateVehicleNumber(value).isValid;
}

export function isIndianVehicleNumberComplete(value: string | null | undefined): boolean {
  const compact = normalizeVehicleNumber(value);
  return STATE_SERIES_REGEX.test(compact) || BH_SERIES_REGEX.test(compact);
}
