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
  lastUpdatedByName: string | null;
  lastUpdatedDate: string | null;
  productRequestNotifyUserId: number | null;
}

export interface TestSmtpConnectionResult {
  success: boolean;
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
  // Branding (accentColor/fontFamily/baseFontSize) is no longer editable from this page's UI —
  // the "Branding" section was removed — but these three are still round-tripped from load
  // straight back into every save unchanged, so an existing template's real accent color/font/
  // size (still used in actual outgoing emails, which reference these via [AccentColor] etc.
  // merge tags) is never silently blanked out by a save made from this page.
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
