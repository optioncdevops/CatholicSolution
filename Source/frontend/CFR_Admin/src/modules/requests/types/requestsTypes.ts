// The four request statuses: pending (shown as "Requested"), sent-to-vendor, approved, rejected.
export type RequestStatus = 'pending' | 'sent-to-vendor' | 'approved' | 'rejected';

// Actions an admin can take on a Requested line. info-requested only emails the requester - the
// request stays Requested.
export type RequestResolveAction = 'approved' | 'rejected' | 'info-requested';

export interface AccessRequestTimelineApiItem {
  status: RequestStatus | 'submitted' | 'info-requested';
  at: string;
  note?: string;
  actor: string;
}

export interface AccessRequestCommentApiItem {
  commentId: number;
  comment: string;
  actor: string;
  at: string;
}

export interface AccessRequestApiItem {
  accessRequestId: number;
  accessRequestProductId: number;
  organizationId: number;
  organizationName: string;
  organizationType?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  requesterName: string;
  requesterEmail: string;
  productId: string;
  productName: string;
  status: RequestStatus;
  submittedAt: string;
  timeline: AccessRequestTimelineApiItem[];
  comments: AccessRequestCommentApiItem[];
}

export interface SaveAccessRequestPayload {
  productId: string;
  productName: string;
  requesterName: string;
  requesterEmail: string;
  comment?: string;
}

export interface UpdateAccessRequestStatusPayload {
  accessRequestId: number;
  accessRequestProductId?: number | null;
  status: RequestResolveAction;
  note?: string;
}

export interface AccessRequestReviewFormValues {
  note: string;
}
