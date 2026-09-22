import type { ProductRequestReviewFormValues, ProductRequestStatus } from '../types/productRequestsTypes';

export const PRODUCT_REQUEST_STATUS_FILTERS: Array<{ id: ProductRequestStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All statuses' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export const productRequestReviewDefaultValues: ProductRequestReviewFormValues = {
  decisionRemarks: '',
};

export const productRequestReviewRules = {
  decisionRemarks: {
    maxLength: { value: 500, message: 'Remarks must be 500 characters or fewer.' },
  },
};
