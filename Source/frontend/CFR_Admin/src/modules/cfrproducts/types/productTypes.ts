export type ProductDetailsTab = 'details' | 'customers' | 'license-details' | 'license-history' | 'api-integration';

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
  shortName?: string | null;
  subCategoryName: string | null;
  prodDescription: string | null;
  externalPageUrl: string | null;
  logoName?: string | null;
  isActive: boolean;
  productStatus?: number | null;
  licenseType?: string | null;
  navigationTarget?: string | null;
  customerCount: number;
  contactUserId: number | null;
  contactPerson: string | null;
  productSupportUser?: number | null;
  productSupportUserName?: string | null;
  features?: string[];
  createdDate: string;
  insertedBy: number | null;
  updatedDate: string | null;
  updatedBy: number | null;
  updatedByName?: string | null;
  isDeleted: boolean;
  clientId?: string | null;
  clientSecret?: string | null;
}


export interface ProductInputPayload {
  productId: number;
  productName: string;
  shortName?: string | null;
  subCategoryName?: string | null;
  prodDescription?: string | null;
  externalPageUrl?: string | null;
  logoName?: string | null;
  contactUserId?: number | null;
  productSupportUser?: number | null;
  features?: string[];
  isActive: boolean;
  productStatus?: number | null;
  navigationTarget?: string | null;
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

export interface ProductApiIntegrationApiItem {
  productEnvironmentId: number;
  site: string;
  siteUrl?: string | null;
  siteDescription?: string | null;
}

export interface ProductApiIntegrationRow {
  id: string;
  productEnvironmentId: number;
  site: string;
  siteUrl: string;
  siteDescription: string;
}

export interface ProductAssignmentSummaryApiItem {
  productId: number;
  productName: string;
  activeOrgCount: number;
  inactiveOrgCount: number;
  totalOrgCount: number;
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
  licenseStatus: string;
  assignStatus?: string | null;
  issuedBy?: number | null;
  remarks?: string | null;
  createdDate?: string | null;
}

export interface ProductLicenseHistoryRow {
  id: string;
  licenseId: number;
  invoiceNumber: string;
  orgId: string;
  customerCode: string;
  customer: string;
  startDate: string;
  expiryDate: string;
  paidOn?: string | null;
  paymentStatus: 'paid' | 'overdue' | 'suspended' | 'unpaid';
  term: 'Current' | 'Past';
  status: 'active' | 'expiring-soon' | 'expired';
  rawStatus: string;
  remarks?: string | null;
}

export interface LiveProductLicense {
  id: string;
  orgId: number;
  customerCode: string;
  customer: string;
  invoiceNumber: string;
  licenseNumber: string;
  licenseKey: string;
  licenseType: string;
  startDate: string;
  expiryDate: string;
  days: number | null;
  paidOn: string | null;
  status: string;
  remarks?: string | null;
}

