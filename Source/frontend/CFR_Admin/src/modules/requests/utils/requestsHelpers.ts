import type { AccessRequestApiItem, AccessRequestTimelineApiItem, RequestStatus } from '../types/requestsTypes';

const REQUEST_STATUSES: RequestStatus[] = ['pending', 'sent-to-vendor', 'approved', 'rejected'];

// Only four statuses exist: requested (pending), sent-to-vendor, approved, rejected. Anything else
// (e.g. a legacy info-requested / in-review line) is still waiting on a decision, so it reads as Requested.
export const normalizeRequestStatus = (value: unknown): RequestStatus => {
  const raw = String(value ?? '').trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (raw === 'requested') return 'pending';
  if (REQUEST_STATUSES.includes(raw as RequestStatus)) return raw as RequestStatus;
  return 'pending';
};

const normalizeTimeline = (value: unknown): AccessRequestTimelineApiItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const row = entry as Record<string, unknown>;
    const statusRaw = String(row.status ?? row.Status ?? '').trim().toLowerCase().replace(/[_\s]+/g, '-');
    return {
      // Timeline rows are events, so an info request is still shown as its own entry.
      status: statusRaw === 'submitted' || statusRaw === 'info-requested' ? statusRaw : normalizeRequestStatus(row.status ?? row.Status),
      at: String(row.at ?? row.At ?? ''),
      note: row.note != null ? String(row.note) : (row.Note != null ? String(row.Note) : undefined),
      actor: String(row.actor ?? row.Actor ?? ''),
    };
  });
};

export const normalizeAccessRequest = (resultData: unknown): AccessRequestApiItem | null => {
  if (!resultData || typeof resultData !== 'object') return null;
  const row = resultData as Record<string, unknown>;
  const accessRequestId = Number(row.accessRequestId ?? row.AccessRequestId);
  if (!Number.isFinite(accessRequestId) || accessRequestId <= 0) return null;
  return {
    accessRequestId,
    accessRequestProductId: Number(row.accessRequestProductId ?? row.AccessRequestProductId) || 0,
    organizationId: Number(row.organizationId ?? row.OrganizationId) || 0,
    organizationName: String(row.organizationName ?? row.OrganizationName ?? ''),
    organizationType: String(row.organizationType ?? row.OrganizationType ?? ''),
    address: String(row.address ?? row.Address ?? ''),
    city: String(row.city ?? row.City ?? ''),
    state: String(row.state ?? row.State ?? ''),
    zip: String(row.zip ?? row.Zip ?? ''),
    phone: String(row.phone ?? row.Phone ?? ''),
    requesterName: String(row.requesterName ?? row.RequesterName ?? ''),
    requesterEmail: String(row.requesterEmail ?? row.RequesterEmail ?? ''),
    productId: String(row.productId ?? row.ProductId ?? ''),
    productName: String(row.productName ?? row.ProductName ?? ''),
    status: normalizeRequestStatus(row.status ?? row.Status),
    submittedAt: String(row.submittedAt ?? row.SubmittedAt ?? ''),
    productContactName: String(row.productContactName ?? row.ProductContactName ?? ''),
    productContactEmail: String(row.productContactEmail ?? row.ProductContactEmail ?? ''),
    timeline: normalizeTimeline(row.timeline ?? row.Timeline),
    comments: Array.isArray(row.comments ?? row.Comments) ? (row.comments ?? row.Comments) as AccessRequestApiItem['comments'] : [],
  };
};

export const normalizeAccessRequestList = (resultData: unknown): AccessRequestApiItem[] => {
  const list = Array.isArray(resultData)
    ? resultData
    : (resultData && typeof resultData === 'object' && Array.isArray((resultData as { data?: unknown }).data)
      ? (resultData as { data: unknown[] }).data
      : []);
  return list.map((row) => normalizeAccessRequest(row)).filter((row): row is AccessRequestApiItem => row != null);
};

export const uniqueRequestFilterOptions = (
  rows: AccessRequestApiItem[],
  idKey: 'productId' | 'organizationId',
  labelKey: 'productName' | 'organizationName',
): Array<{ id: string; value: string }> => {
  const seen = new Set<string>();
  const options: Array<{ id: string; value: string }> = [];
  rows.forEach((row) => {
    const id = String(row[idKey] ?? '').trim();
    if (!id || id === '0' || seen.has(id)) return;
    seen.add(id);
    options.push({ id, value: String(row[labelKey] || '—') });
  });
  return options;
};
