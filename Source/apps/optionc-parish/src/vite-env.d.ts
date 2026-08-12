/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_APP_ID: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_BASE_PATH: string;
  readonly VITE_ENABLE_DOMAIN_ROUTING: string;
  readonly VITE_AUTH_MODE: 'mock' | 'sso';
  readonly VITE_DEV_PORT: string;
  readonly VITE_AUTH_ORIGIN: string;
  readonly VITE_LOGIN_ORIGIN: string;
  readonly VITE_PLATFORM_ORIGIN: string;
  readonly VITE_OPTIONC_SCHOOL_ORIGIN: string;
  readonly VITE_MATT_MONEY_ORIGIN: string;
  readonly VITE_ARC_ALERTS_ORIGIN: string;
  readonly VITE_OPTIONC_PARISH_ORIGIN: string;
  readonly VITE_CATHOLIC_CONTENT_ORIGIN: string;
  readonly VITE_UNIFIED_DIRECTORY_ORIGIN: string;
  readonly VITE_SUPPORT_CENTER_ORIGIN: string;
}

interface ImportMeta { readonly env: ImportMetaEnv }
