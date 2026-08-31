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
