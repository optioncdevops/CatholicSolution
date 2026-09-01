import type { AccessRequestReviewFormValues, RequestStatus } from '../types/requestsTypes';

export const REQUEST_STATUS_FILTERS: Array<{ id: RequestStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'info-requested', label: 'Info requested' },
];

export const accessRequestReviewDefaultValues: AccessRequestReviewFormValues = {
  note: '',
};

export const resolveRequestStatusRules = {
  note: {
    maxLength: { value: 500, message: 'Note must be 500 characters or fewer.' },
  },
};

export const ALLOWED_RESOLVE_STATUSES: RequestStatus[] = ['approved', 'rejected', 'info-requested'];
