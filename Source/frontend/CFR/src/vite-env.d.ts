/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_REST_API_BASE_URL?: string;
  readonly VITE_AUTH0_DOMAIN?: string;
  readonly VITE_AUTH0_CLIENT_ID?: string;
  readonly VITE_AUTH0_DB_CONNECTION?: string;
  readonly VITE_AUTH0_GOOGLE_CONNECTION?: string;
  readonly VITE_AUTH0_MICROSOFT_CONNECTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
