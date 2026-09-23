export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'info-requested';

export interface AccessRequestTimelineApiItem {
  status: RequestStatus | 'submitted';
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
  status: RequestStatus;
  note?: string;
}

export interface AccessRequestReviewFormValues {
  note: string;
}
