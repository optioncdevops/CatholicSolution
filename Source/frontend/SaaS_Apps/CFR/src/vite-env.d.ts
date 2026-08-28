/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SWITCHER_URL: string;
  readonly VITE_APP_HUB_URL: string;
}

interface ImportMeta { readonly env: ImportMetaEnv }

interface ImportMetaEnv {
  readonly VITE_APP_ID: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_BASE_PATH: string;
  readonly VITE_ENABLE_DOMAIN_ROUTING: string;
  readonly VITE_DEV_PORT: string;
  readonly VITE_DEPLOYMENT_TARGET?: 'staging';
}

interface ImportMeta { readonly env: ImportMetaEnv }
