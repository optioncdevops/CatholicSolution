/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_REST_API_BASE_URL?: string;
  readonly VITE_PLATFORM_ORIGIN?: string;
  readonly VITE_PLATFORM_ADMIN_ORIGIN?: string;
  readonly VITE_AUTH_MODE?: string;
  readonly VITE_SESSION_COOKIE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
