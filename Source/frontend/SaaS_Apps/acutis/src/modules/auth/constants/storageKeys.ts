/**
 * What is stored: the full last-successful login response (thin identity, moduleRights,
 * menuItems, token) — matches the reference app's own storage choice
 * (docs/acutis-auth-spec/reference-comparison.md §6/§7). Nothing beyond what the backend already
 * returns is added; no password, no raw claims, no server secrets.
 */
export const ACUTIS_AUTH_STORAGE_KEY = 'acutis_auth_state';
