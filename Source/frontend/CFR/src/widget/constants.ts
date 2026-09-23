// Captured synchronously at script-execution time, before any async gap - document.currentScript
// is only valid during that initial (sync) run, even with `defer`. This gives us "where was this
// widget itself loaded from," i.e. the CFR app's own origin, used for the App Hub footer link, and
// the script tag's own data-* attributes for direct CFR.DataSync mode.
const SELF_SCRIPT_EL = document.currentScript as HTMLScriptElement | null;

export const SELF_SCRIPT_SRC = SELF_SCRIPT_EL?.src ?? '';
export const DATASYNC_BASE_URL = (SELF_SCRIPT_EL?.dataset.cfrDatasyncBaseUrl ?? '').replace(/\/+$/, '');
export const DATASYNC_CLIENT_ID = SELF_SCRIPT_EL?.dataset.cfrDatasyncClientId ?? '';
export const DATASYNC_CLIENT_SECRET = SELF_SCRIPT_EL?.dataset.cfrDatasyncClientSecret ?? '';
// The host's own CFR [core].[Product].ProductId (e.g. SMS's CfrAuthenticationSettings:ProductId),
// so the tile for the app the visitor is already inside can be shown as current/disabled instead
// of relaunching itself.
export const CURRENT_PRODUCT_ID = SELF_SCRIPT_EL?.dataset.cfrCurrentProductId ?? '';
// CFR.Gateway origin for the anonymous product catalog (default mode) and for logo image URLs
// (either mode). Supplied by the host page from its own env config via data-cfr-gateway-origin -
// e.g. SMS's VITE_CFR_GATEWAY_ORIGIN - never baked in at CFR's own build time, so one widget
// build works unchanged across every environment instead of freezing whichever origin CFR itself
// last happened to build with. A host that omits it just gets no logos (falls back to a letter
// avatar - see ui/render.ts) instead of the whole widget failing.
export const CFR_GATEWAY_ORIGIN = (SELF_SCRIPT_EL?.dataset.cfrGatewayOrigin ?? '').replace(/\/+$/, '');

export const CLASS_PREFIX = 'cfrsw';
export const SLOT_ID = 'cfr-app-switcher-slot';
export const PRODUCTS_ENDPOINT_PATH = '/acutis/api/v1/Products/GetProducts';
export const LOGO_PUBLIC_PATH = '/acutis/Acutis/Attachment/Products/';
export const DATASYNC_LOGIN_PATH = '/api/v1/Auth/Login';
// Controller class is ProductsController (Controllers/ProductSync/ is just the folder name) -
// BaseController routes off the class name, so the real path is /Products/, not /ProductSync/.
export const DATASYNC_PRODUCTS_PATH = '/api/v1/Products/GetUserProducts';
export const DATASYNC_LAUNCH_PATH = '/api/v1/Products/LaunchProduct';
export const HOST_SESSION_EMAIL_KEY = 'cfrEmail';
// Cached in this tab's sessionStorage after the first successful Auth/Login, so a later page
// load in the same tab (refresh, another page on the host) can skip that round trip entirely -
// see services/dataSyncClient.ts.
export const DATASYNC_TOKEN_STORAGE_KEY = 'cfrswDataSyncToken';
export const SLOT_WAIT_TIMEOUT_MS = 4000;

export const TILE_COLORS = [
  '#4F46E5', '#059669', '#DC2626', '#D97706', '#0EA5E9',
  '#7C3AED', '#DB2777', '#0D9488', '#475569', '#EA580C',
];
