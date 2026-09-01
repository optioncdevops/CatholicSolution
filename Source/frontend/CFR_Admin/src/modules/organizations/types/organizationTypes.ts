export interface OrganizationApiItem {
  orgId: number;
  orgName: string;
  orgStatus: string;
  contactEmail: string | null;
  website: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
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
}

export interface UpdateOrganizationPayload {
  orgId: number;
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
}

export interface CreateOrganizationPayload {
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
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
