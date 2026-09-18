export interface AccessRequestProductItem {
  productId: string;
  productName: string;
}

export interface SaveAccessRequestPayload {
  productId: string;
  productName: string;
  requesterName: string;
  requesterEmail: string;
  sendToEmail?: string;
  comment?: string;
  firstName?: string;
  lastName?: string;
  organizationType?: string;
  organizationName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  dioceseId?: number;
  phone?: string;
  products?: AccessRequestProductItem[];
}

export interface PublicAccessRequestFormValues {
  firstName: string;
  lastName: string;
  organizationType: string;
  organizationName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dioceseId: string;
  email: string;
  phone: string;
  notes: string;
}

export interface DioceseOption {
  dioceseId: number;
  dioceseName: string;
  address?: string;
  city?: string;
  state?: string;
}
