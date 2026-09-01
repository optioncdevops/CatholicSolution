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
  features?: string[];
  isActive: boolean;
  isAvailable: boolean;
}

export interface ProductInputPayload extends ProductSaveInputPayload {
  productId: number;
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

