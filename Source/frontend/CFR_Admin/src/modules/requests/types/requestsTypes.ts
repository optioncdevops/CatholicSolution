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
  organizationId: number;
  organizationName: string;
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
  status: RequestStatus;
  note?: string;
}

export interface AccessRequestReviewFormValues {
  note: string;
}
