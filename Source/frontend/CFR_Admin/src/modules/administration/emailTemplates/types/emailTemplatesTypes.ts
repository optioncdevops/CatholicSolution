export type EmailTemplateStatusValue = 'active' | 'inactive';

export interface EmailTemplateApiItem {
  templateId: number;
  templateCode: string;
  subject: string;
  body: string;
  status: EmailTemplateStatusValue;
  createdDate: string | null;
  updatedDate: string | null;
  accentColor: string;
  logoUrl: string | null;
  fontFamily: string;
  baseFontSize: number;
}

export interface EmailTemplateFormValues {
  subject: string;
  body: string;
  accentColor: string;
  logoUrl: string;
  fontFamily: string;
  baseFontSize: number;
}

export interface SaveEmailTemplatePayload {
  templateId: number;
  templateCode?: string;
  subject: string;
  body: string;
  status: EmailTemplateStatusValue;
  accentColor: string;
  logoUrl: string;
  fontFamily: string;
  baseFontSize: number;
}

export interface SendTestEmailPayload {
  templateCode: string;
  subject: string;
  body: string;
  toAddress: string;
  accentColor: string;
  logoUrl: string;
  fontFamily: string;
  baseFontSize: number;
}

export interface EmailTemplateVariable {
  token: string;
  label: string;
}
