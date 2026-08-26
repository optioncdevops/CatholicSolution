/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ID: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_REST_API_BASE_URL: string;
  readonly VITE_ACUTIS_AUTH_MODE: 'mock' | 'api';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
