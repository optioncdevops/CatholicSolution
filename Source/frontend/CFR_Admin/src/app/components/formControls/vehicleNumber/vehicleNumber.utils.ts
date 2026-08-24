import {
  detectIndianVehicleType,
  INDIAN_STATE_CODES,
  isValidStateCodePrefix,
  normalizeVehicleNumber,
  type VehicleNumberType,
} from "./vehicleNumber.validator";

export interface VehicleCountryOption {
  code: string;
  name: string;
  /** ISO 3166-1 alpha-2 lower-case for flag CDN. */
  iso2: string;
  flagUrl: string;
}

function flagUrl(iso2: string): string {
  return `https://flagcdn.com/w40/${iso2.toLowerCase()}.png`;
}

function country(code: string, name: string, iso2: string): VehicleCountryOption {
  return { code, name, iso2: iso2.toUpperCase(), flagUrl: flagUrl(iso2) };
}

/** ISO countries (India first). 195+ entries with flagcdn images. */
const WORLD_COUNTRIES: [string, string][] = [
  ["AF", "Afghanistan"], ["AL", "Albania"], ["DZ", "Algeria"], ["AD", "Andorra"],
  ["AO", "Angola"], ["AG", "Antigua and Barbuda"], ["AR", "Argentina"], ["AM", "Armenia"],
  ["AU", "Australia"], ["AT", "Austria"], ["AZ", "Azerbaijan"], ["BS", "Bahamas"],
  ["BH", "Bahrain"], ["BD", "Bangladesh"], ["BB", "Barbados"], ["BY", "Belarus"],
  ["BE", "Belgium"], ["BZ", "Belize"], ["BJ", "Benin"], ["BT", "Bhutan"],
  ["BO", "Bolivia"], ["BA", "Bosnia and Herzegovina"], ["BW", "Botswana"], ["BR", "Brazil"],
  ["BN", "Brunei"], ["BG", "Bulgaria"], ["BF", "Burkina Faso"], ["BI", "Burundi"],
  ["CV", "Cabo Verde"], ["KH", "Cambodia"], ["CM", "Cameroon"], ["CA", "Canada"],
  ["CF", "Central African Republic"], ["TD", "Chad"], ["CL", "Chile"], ["CN", "China"],
  ["CO", "Colombia"], ["KM", "Comoros"], ["CG", "Congo"], ["CD", "Congo (DRC)"],
  ["CR", "Costa Rica"], ["CI", "Côte d'Ivoire"], ["HR", "Croatia"], ["CU", "Cuba"],
  ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"], ["DJ", "Djibouti"],
  ["DM", "Dominica"], ["DO", "Dominican Republic"], ["EC", "Ecuador"], ["EG", "Egypt"],
  ["SV", "El Salvador"], ["GQ", "Equatorial Guinea"], ["ER", "Eritrea"], ["EE", "Estonia"],
  ["SZ", "Eswatini"], ["ET", "Ethiopia"], ["FJ", "Fiji"], ["FI", "Finland"],
  ["FR", "France"], ["GA", "Gabon"], ["GM", "Gambia"], ["GE", "Georgia"],
  ["DE", "Germany"], ["GH", "Ghana"], ["GR", "Greece"], ["GD", "Grenada"],
  ["GT", "Guatemala"], ["GN", "Guinea"], ["GW", "Guinea-Bissau"], ["GY", "Guyana"],
  ["HT", "Haiti"], ["HN", "Honduras"], ["HU", "Hungary"], ["IS", "Iceland"],
  ["ID", "Indonesia"], ["IR", "Iran"], ["IQ", "Iraq"], ["IE", "Ireland"],
  ["IL", "Israel"], ["IT", "Italy"], ["JM", "Jamaica"], ["JP", "Japan"],
  ["JO", "Jordan"], ["KZ", "Kazakhstan"], ["KE", "Kenya"], ["KI", "Kiribati"],
  ["KP", "North Korea"], ["KR", "South Korea"], ["KW", "Kuwait"], ["KG", "Kyrgyzstan"],
  ["LA", "Laos"], ["LV", "Latvia"], ["LB", "Lebanon"], ["LS", "Lesotho"],
  ["LR", "Liberia"], ["LY", "Libya"], ["LI", "Liechtenstein"], ["LT", "Lithuania"],
  ["LU", "Luxembourg"], ["MG", "Madagascar"], ["MW", "Malawi"], ["MY", "Malaysia"],
  ["MV", "Maldives"], ["ML", "Mali"], ["MT", "Malta"], ["MH", "Marshall Islands"],
  ["MR", "Mauritania"], ["MU", "Mauritius"], ["MX", "Mexico"], ["FM", "Micronesia"],
  ["MD", "Moldova"], ["MC", "Monaco"], ["MN", "Mongolia"], ["ME", "Montenegro"],
  ["MA", "Morocco"], ["MZ", "Mozambique"], ["MM", "Myanmar"], ["NA", "Namibia"],
  ["NR", "Nauru"], ["NP", "Nepal"], ["NL", "Netherlands"], ["NZ", "New Zealand"],
  ["NI", "Nicaragua"], ["NE", "Niger"], ["NG", "Nigeria"], ["MK", "North Macedonia"],
  ["NO", "Norway"], ["OM", "Oman"], ["PK", "Pakistan"], ["PW", "Palau"],
  ["PS", "Palestine"], ["PA", "Panama"], ["PG", "Papua New Guinea"], ["PY", "Paraguay"],
  ["PE", "Peru"], ["PH", "Philippines"], ["PL", "Poland"], ["PT", "Portugal"],
  ["QA", "Qatar"], ["RO", "Romania"], ["RU", "Russia"], ["RW", "Rwanda"],
  ["KN", "Saint Kitts and Nevis"], ["LC", "Saint Lucia"],
  ["VC", "Saint Vincent and the Grenadines"], ["WS", "Samoa"], ["SM", "San Marino"],
  ["ST", "Sao Tome and Principe"], ["SA", "Saudi Arabia"], ["SN", "Senegal"],
  ["RS", "Serbia"], ["SC", "Seychelles"], ["SL", "Sierra Leone"], ["SG", "Singapore"],
  ["SK", "Slovakia"], ["SI", "Slovenia"], ["SB", "Solomon Islands"], ["SO", "Somalia"],
  ["ZA", "South Africa"], ["SS", "South Sudan"], ["ES", "Spain"], ["LK", "Sri Lanka"],
  ["SD", "Sudan"], ["SR", "Suriname"], ["SE", "Sweden"], ["CH", "Switzerland"],
  ["SY", "Syria"], ["TW", "Taiwan"], ["TJ", "Tajikistan"], ["TZ", "Tanzania"],
  ["TH", "Thailand"], ["TL", "Timor-Leste"], ["TG", "Togo"], ["TO", "Tonga"],
  ["TT", "Trinidad and Tobago"], ["TN", "Tunisia"], ["TR", "Türkiye"],
  ["TM", "Turkmenistan"], ["TV", "Tuvalu"], ["UG", "Uganda"], ["UA", "Ukraine"],
  ["AE", "United Arab Emirates"], ["GB", "United Kingdom"], ["US", "United States"],
  ["UY", "Uruguay"], ["UZ", "Uzbekistan"], ["VU", "Vanuatu"], ["VA", "Vatican City"],
  ["VE", "Venezuela"], ["VN", "Vietnam"], ["YE", "Yemen"], ["ZM", "Zambia"],
  ["ZW", "Zimbabwe"], ["HK", "Hong Kong"], ["MO", "Macao"], ["XK", "Kosovo"],
];

export const VEHICLE_COUNTRY_OPTIONS: VehicleCountryOption[] = [
  country("IN", "India", "in"),
  ...WORLD_COUNTRIES
    .filter(([code]) => code !== "IN")
    .map(([code, name]) => country(code, name, code.toLowerCase())),
];

export const DEFAULT_VEHICLE_COUNTRY_CODE = "IN";

export function getVehicleCountryOption(code: string | null | undefined): VehicleCountryOption {
  const normalized = String(code ?? "").toUpperCase();
  return (
    VEHICLE_COUNTRY_OPTIONS.find((item) => item.code === normalized)
    ?? VEHICLE_COUNTRY_OPTIONS[0]
  );
}

function joinParts(...parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

function parseBharatParts(raw: string): {
  year: string;
  /** "" | "B" | "BH" — what the user has typed (or implied) for the BH marker. */
  bhTyped: string;
  number: string;
  letters: string;
} {
  const chars = normalizeVehicleNumber(raw);
  let year = "";
  let bhTyped = "";
  let number = "";
  let letters = "";
  let phase: "year" | "bh" | "number" | "letters" = "year";

  for (const ch of chars) {
    if (phase === "year") {
      if (/\d/.test(ch) && year.length < 2) {
        year += ch;
        if (year.length === 2) {
          phase = "bh";
        }
      }
    } else if (phase === "bh") {
      if (ch === "B" && bhTyped.length === 0) {
        bhTyped = "B";
      } else if (ch === "H" && bhTyped === "B") {
        bhTyped = "BH";
        phase = "number";
      } else if (/\d/.test(ch)) {
        // Digits after year (with or without typed B) imply full BH marker.
        bhTyped = "BH";
        phase = "number";
        number += ch;
        if (number.length === 4) {
          phase = "letters";
        }
      }
    } else if (phase === "number") {
      if (/\d/.test(ch) && number.length < 4) {
        number += ch;
        if (number.length === 4) {
          phase = "letters";
        }
      }
    } else if (/[A-Z]/.test(ch) && letters.length < 2) {
      letters += ch;
    }
  }

  return { year, bhTyped, number, letters };
}

function formatBharatDisplay(raw: string): string {
  const { year, bhTyped, number, letters } = parseBharatParts(raw);
  if (year.length < 2) {
    return year;
  }
  // Year only — keep backspace friendly (do not force "26 BH").
  if (!bhTyped && !number && !letters) {
    return year;
  }
  // Allow typing BH: "26" → "26 B" → "26 BH" → "26 BH 4587 AK"
  const bhPart = bhTyped === "B" ? "B" : "BH";
  return joinParts(year, bhPart, number, letters);
}

function formatStateSeriesDisplay(raw: string): string {
  const chars = normalizeVehicleNumber(raw);
  let state = "";
  let rto = "";
  let series = "";
  let number = "";
  let phase: "state" | "rto" | "series" | "number" = "state";

  for (const ch of chars) {
    if (phase === "state") {
      if (/[A-Z]/.test(ch) && state.length < 2) {
        const next = state + ch;
        if (!isValidStateCodePrefix(next)) {
          continue;
        }
        state = next;
        if (state.length === 2) {
          phase = "rto";
        }
      }
    } else if (phase === "rto") {
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

  return joinParts(state, rto, series, number);
}

/**
 * Live mask for Indian plates while typing.
 * - State series: TN 01 AJ 0001 (first 2 letters must match a known state/UT code)
 * - Bharat series: 26 BH 4587 AK
 */
export function maskIndianVehicleNumberInput(value: string | null | undefined): string {
  const compact = normalizeVehicleNumber(value);
  if (!compact) {
    return "";
  }

  const type = detectIndianVehicleType(compact);
  if (type === "bharat-series") {
    return formatBharatDisplay(compact);
  }

  return formatStateSeriesDisplay(compact);
}

/** Free-text plate for non-India countries (uppercase alphanumerics + spaces). */
export function maskGenericVehicleNumberInput(value: string | null | undefined): string {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s/-]/g, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, 20);
}

export function maskVehicleNumberForCountry(
  value: string | null | undefined,
  countryCode: string,
): string {
  if (countryCode.toUpperCase() === "IN") {
    return maskIndianVehicleNumberInput(value);
  }
  return maskGenericVehicleNumberInput(value);
}

export function getVehicleInputPlaceholder(countryCode: string): string {
  if (countryCode.toUpperCase() === "IN") {
    return "TN 01 AJ 0001 or 26 BH 4587 AK";
  }
  return "ENTER VEHICLE NUMBER";
}

export function getVehicleInputMaxLength(countryCode: string): number {
  if (countryCode.toUpperCase() === "IN") {
    return 14; // "TN 01 AJ 0001" / "26 BH 4587 AK"
  }
  return 20;
}

export function toCompactVehicleNumber(value: string | null | undefined): string {
  return normalizeVehicleNumber(value);
}

export function formatVehicleNumber(value: string | null | undefined): string {
  return maskIndianVehicleNumberInput(value);
}

export function isIndianStateCode(code: string): boolean {
  return (INDIAN_STATE_CODES as string[]).includes(code.toUpperCase());
}

export type { VehicleNumberType };
