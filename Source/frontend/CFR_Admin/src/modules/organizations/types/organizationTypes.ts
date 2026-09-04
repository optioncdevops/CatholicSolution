export interface OrganizationApiItem {
  orgId: number;
  orgName: string;
  orgStatus: string;
  contactEmail: string | null;
  website: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  insertedDate: string;
  updatedDate: string | null;
  userCount: number;
  productCount: number;
}

export interface OrganizationFormValues {
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface UpdateOrganizationPayload {
  orgId: number;
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface CreateOrganizationPayload {
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrganizationUserApiItem {
  authUserId: number;
  email: string;
  memberStatus: string | null;
  linkedDate: string;
}

export interface OrganizationProductApiItem {
  productId: number;
  productName: string;
  subCategoryName: string | null;
  prodDescription: string | null;
  externalPageUrl: string | null;
  assignStatus: string | null;
  assignedDate: string;
}

export interface AssignableProductApiItem {
  productId: number;
  productName: string;
  subCategoryName: string | null;
}

export interface AssignOrganizationProductPayload {
  orgId: number;
  productId: number;
}

export interface OrganizationLicenseApiItem {
  licenseId: number;
  organizationProductId: number;
  productId: number;
  productName: string;
  licenseType: string | null;
  activationDate: string;
  expiryDate: string | null;
  licenseStatus: string;
  remarks: string | null;
  createdDate: string;
}
