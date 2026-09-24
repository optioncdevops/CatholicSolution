export type EmailTemplateStatusValue = 'active' | 'inactive';

export interface EmailTemplateApiItem {
  templateId: number;
  templateCode: string;
  subject: string;
  body: string;
  status: EmailTemplateStatusValue;
  linkExpiryMinutes: number | null;
  iconName: string | null;
  createdDate: string | null;
  updatedDate: string | null;
}

export interface EmailTemplateFormValues {
  subject: string;
  body: string;
  linkExpiryMinutes: string;
  iconName: string;
}

export interface SaveEmailTemplatePayload {
  templateId: number;
  templateCode?: string;
  subject: string;
  body: string;
  status: EmailTemplateStatusValue;
  linkExpiryMinutes: number | null;
  iconName: string | null;
}

export interface SendTestEmailPayload {
  templateCode: string;
  subject: string;
  body: string;
  toAddress: string;
}

export interface EmailTemplateVariable {
  token: string;
  label: string;
}
