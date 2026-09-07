export type EmailTemplateStatusValue = 'active' | 'inactive';

export interface EmailTemplateApiItem {
  templateId: number;
  templateCode: string;
  subject: string;
  body: string;
  status: EmailTemplateStatusValue;
  createdDate: string | null;
  updatedDate: string | null;
}

export interface EmailTemplateFormValues {
  subject: string;
  body: string;
}

export interface SaveEmailTemplatePayload {
  templateId: number;
  templateCode?: string;
  subject: string;
  body: string;
  status: EmailTemplateStatusValue;
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
