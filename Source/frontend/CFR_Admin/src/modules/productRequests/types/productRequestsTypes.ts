export type ProductRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ProductRequestApiItem {
  productRequestId: number;
  productName: string;
  shortName?: string;
  subCategoryName?: string;
  prodDescription?: string;
  externalPageUrl?: string;
  navigationTarget?: string;
  logoName?: string;
  requesterName: string;
  requesterEmail: string;
  organizationName?: string;
  status: ProductRequestStatus;
  reviewedBy?: number;
  reviewedDate?: string;
  decisionRemarks?: string;
  approvedProductId?: number;
  insertedDate: string;
  features: string[];
}

export interface ProductRequestDecisionPayload {
  productRequestId: number;
  decisionRemarks?: string;
}

export interface ProductRequestReviewFormValues {
  decisionRemarks: string;
}
