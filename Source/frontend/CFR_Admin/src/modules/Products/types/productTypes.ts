export type ProductDetailsTab = 'details' | 'customers' | 'invoice-details' | 'invoice-history';

export interface ProductLocationState {
  productId: number;
  tab?: ProductDetailsTab;
}

export interface ProductContactUser {
  userId: number;
  fullName: string;
  eMail: string;
  isActive: number;
}

export interface ProductApiItem {
  productId: number;
  productName: string;
  subCategoryName: string | null;
  prodDescription: string | null;
  externalPageUrl: string | null;
  defaultAccessDays: number;
  logoUrl?: string | null;
  isActive: boolean;
  isAvailable: boolean;
  customerCount: number;
  contactPerson: string | null;
  features?: string[];
  createdDate: string;
  insertedBy: number | null;
  updatedDate: string | null;
  updatedBy: number | null;
  isDeleted: boolean;
}

export interface ProductSaveInputPayload {
  productName: string;
  subCategoryName?: string | null;
  prodDescription?: string | null;
  externalPageUrl?: string | null;
  defaultAccessDays: number;
  logoUrl?: string | null;
  contactPerson?: string | null;
  features?: string[];
  isActive: boolean;
  isAvailable: boolean;
}

export interface ProductInputPayload extends ProductSaveInputPayload {
  productId: number;
}

export interface ProductLicenseInputPayload {
  licenseId?: number;
  organizationProductId?: number;
  orgId: number;
  productId: number;
  licenseType: string;
  activationDate: string;
  expiryDate: string;
  licenseStatus: string;
  assignStatus?: string;
  remarks?: string;
}

export interface ProductCustomerApiItem {
  orgId: number;
  orgName: string;
  orgStatus: string;
  contactEmail?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  insertedDate: string;
  updatedDate?: string | null;
  userCount: number;
  orgCode?: string | null;
  startDate?: string | null;
  expiryDate?: string | null;
  licenseType?: string | null;
  licenseStatus?: string | null;
}

export interface ProductCustomerRow {
  id: string;
  name: string;
  primaryContact: string;
  code: string;
  contactEmail: string;
  userCount: number;
  createdAt: string;
  expiryDate: string;
  status: 'active' | 'trial' | 'suspended';
}

export interface ProductLicenseApiItem {
  licenseId: number;
  organizationProductId: number;
  orgId: number;
  orgName?: string | null;
  productId: number;
  productName?: string | null;
  licenseType?: string | null;
  activationDate?: string | null;
  expiryDate?: string | null;
  maxUsers?: number | null;
  licenseStatus: string;
  assignStatus?: string | null;
  issuedBy?: number | null;
  remarks?: string | null;
  createdDate?: string | null;
}

export interface ProductLicenseHistoryRow {
  id: string;
  licenseId: number;
  orgId: string;
  customerCode: string;
  customer: string;
  startDate: string;
  expiryDate: string;
  paidOn?: string | null;
  paymentStatus: 'paid' | 'overdue' | 'suspended';
  term: 'Current' | 'Past';
  status: 'active' | 'expiring-soon' | 'expired';
  rawStatus: string;
  remarks?: string | null;
}

