export interface EmailSettingsApiItem {
  sendMailEnabled: boolean;
  smtpServer: string;
  smtpPort: number;
  displayName: string;
  username: string;
  hasPassword: boolean;
  isSslEnabled: boolean;
  ccMailId: string | null;
  contactUsMailId: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  baseFontSize: number | null;
  logoFileName: string | null;
  logoImageUrl: string | null;
  apiBaseUrl: string | null;
}

export interface EmailSettingsFormValues {
  sendMailEnabled: boolean;
  smtpServer: string;
  smtpPort: string;
  displayName: string;
  username: string;
  password: string;
  isSslEnabled: boolean;
  ccMailId: string;
  contactUsMailId: string;
  accentColor: string;
  fontFamily: string;
  baseFontSize: string;
  apiBaseUrl: string;
}

export interface SaveEmailSettingsPayload {
  sendMailEnabled: boolean;
  smtpServer: string;
  smtpPort: number;
  displayName: string;
  username: string;
  password?: string;
  isSslEnabled: boolean;
  ccMailId: string;
  contactUsMailId: string;
  accentColor: string;
  fontFamily: string;
  baseFontSize: number;
  apiBaseUrl: string;
}
