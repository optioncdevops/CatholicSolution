export type HubSectionValue = 'your' | 'available' | 'future';

export interface HubProductApiItem {
  productId: number | string;
  productName: string;
  subCategoryName?: string | null;
  category?: string;
  prodDescription?: string | null;
  description?: string;
  baseUrl?: string | null;
  externalPageUrl?: string | null;
  externalUrl?: string;
  logoUrl?: string | null;
  features?: string[];
  hubSection?: HubSectionValue;
  contactUserId?: number | string | null;
  contactEmail?: string | null;
  canRequest?: boolean | number;
  isOrgApproved?: boolean | number;
  isActive: boolean | number;
  /** 1 = active/available, 2 = coming soon. Only sent by the admin catalog endpoint
   * (Products/GetProducts) - the member Hub endpoint sends hubSection instead. */
  productStatus?: number;
}

