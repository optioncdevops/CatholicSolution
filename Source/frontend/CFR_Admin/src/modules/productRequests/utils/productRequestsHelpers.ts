import type { ProductRequestApiItem, ProductRequestStatus } from '../types/productRequestsTypes';

export const normalizeProductRequestStatus = (value: unknown): ProductRequestStatus => {
  const numeric = Number(value);
  if (numeric === 2) return 'approved';
  if (numeric === 3) return 'rejected';
  return 'pending';
};

export const normalizeProductRequest = (resultData: unknown): ProductRequestApiItem | null => {
  if (!resultData || typeof resultData !== 'object') return null;
  const row = resultData as Record<string, unknown>;
  const productRequestId = Number(row.productRequestId ?? row.ProductRequestId);
  if (!Number.isFinite(productRequestId) || productRequestId <= 0) return null;
  return {
    productRequestId,
    productName: String(row.productName ?? row.ProductName ?? ''),
    shortName: row.shortName != null ? String(row.shortName) : (row.ShortName != null ? String(row.ShortName) : undefined),
    subCategoryName: row.subCategoryName != null ? String(row.subCategoryName) : (row.SubCategoryName != null ? String(row.SubCategoryName) : undefined),
    prodDescription: row.prodDescription != null ? String(row.prodDescription) : (row.ProdDescription != null ? String(row.ProdDescription) : undefined),
    externalPageUrl: row.externalPageUrl != null ? String(row.externalPageUrl) : (row.ExternalPageUrl != null ? String(row.ExternalPageUrl) : undefined),
    navigationTarget: row.navigationTarget != null ? String(row.navigationTarget) : (row.NavigationTarget != null ? String(row.NavigationTarget) : undefined),
    logoName: row.logoName != null ? String(row.logoName) : (row.LogoName != null ? String(row.LogoName) : undefined),
    requesterName: String(row.requesterName ?? row.RequesterName ?? ''),
    requesterEmail: String(row.requesterEmail ?? row.RequesterEmail ?? ''),
    organizationName: row.organizationName != null ? String(row.organizationName) : (row.OrganizationName != null ? String(row.OrganizationName) : undefined),
    status: normalizeProductRequestStatus(row.requestStatus ?? row.RequestStatus),
    reviewedBy: row.reviewedBy != null ? Number(row.reviewedBy) : (row.ReviewedBy != null ? Number(row.ReviewedBy) : undefined),
    reviewedDate: row.reviewedDate != null ? String(row.reviewedDate) : (row.ReviewedDate != null ? String(row.ReviewedDate) : undefined),
    decisionRemarks: row.decisionRemarks != null ? String(row.decisionRemarks) : (row.DecisionRemarks != null ? String(row.DecisionRemarks) : undefined),
    approvedProductId: row.approvedProductId != null ? Number(row.approvedProductId) : (row.ApprovedProductId != null ? Number(row.ApprovedProductId) : undefined),
    insertedDate: String(row.insertedDate ?? row.InsertedDate ?? ''),
    features: Array.isArray(row.features ?? row.Features) ? (row.features ?? row.Features) as string[] : [],
  };
};

export const normalizeProductRequestList = (resultData: unknown): ProductRequestApiItem[] => {
  const list = Array.isArray(resultData)
    ? resultData
    : (resultData && typeof resultData === 'object' && Array.isArray((resultData as { data?: unknown }).data)
      ? (resultData as { data: unknown[] }).data
      : []);
  return list.map((row) => normalizeProductRequest(row)).filter((row): row is ProductRequestApiItem => row != null);
};
