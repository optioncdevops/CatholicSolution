export interface LiveOrganizationApiItem {
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

export interface LiveOrganizationFormValues {
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
}

export interface UpdateLiveOrganizationPayload {
  orgId: number;
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
}

export interface CreateLiveOrganizationPayload {
  orgName: string;
  orgStatus: string;
  contactEmail: string;
  website: string;
  contactPerson: string;
  contactPhone: string;
}

export interface LiveOrganizationUserApiItem {
  authUserId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  memberStatus: string | null;
  linkedDate: string;
}

export interface LiveOrganizationProductApiItem {
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

export interface AssignLiveOrganizationProductPayload {
  orgId: number;
  productId: number;
}
