import type { AccessRequestReviewFormValues, RequestResolveAction, RequestStatus } from '../types/requestsTypes';

export const REQUEST_STATUS_FILTERS: Array<{ id: RequestStatus | 'all'; label: string }> = [
  { id: 'pending', label: 'Requested' },
  { id: 'sent-to-vendor', label: 'Sent to vendor' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All statuses' },
];

/** Tab the Access Requests page opens on when the URL has no ?status= - the requests waiting on an admin. */
export const DEFAULT_REQUEST_STATUS_FILTER: RequestStatus | 'all' = 'pending';

export const accessRequestReviewDefaultValues: AccessRequestReviewFormValues = {
  note: '',
};

export const resolveRequestStatusRules = {
  note: {
    maxLength: { value: 500, message: 'Note must be 500 characters or fewer.' },
  },
};

export const ALLOWED_RESOLVE_STATUSES: RequestResolveAction[] = ['sent-to-vendor', 'approved', 'rejected'];
