import type { AccessRequestApiItem, AccessRequestTimelineApiItem, RequestStatus } from '../types/requestsTypes';

const REQUEST_STATUSES: RequestStatus[] = ['pending', 'approved', 'rejected', 'info-requested'];

export const normalizeRequestStatus = (value: unknown): RequestStatus => {
  const raw = String(value ?? '').trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (raw === 'in-review') return 'info-requested';
  if (REQUEST_STATUSES.includes(raw as RequestStatus)) return raw as RequestStatus;
  return 'pending';
};

const normalizeTimeline = (value: unknown): AccessRequestTimelineApiItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => {
    const row = entry as AccessRequestTimelineApiItem;
    const statusRaw = String(row.status ?? '').trim().toLowerCase().replace(/[_\s]+/g, '-');
    return {
      status: statusRaw === 'submitted' ? 'submitted' : normalizeRequestStatus(row.status),
      at: String(row.at ?? ''),
      note: row.note,
      actor: String(row.actor ?? ''),
    };
  });
};

export const normalizeAccessRequest = (resultData: unknown): AccessRequestApiItem | null => {
  if (!resultData || typeof resultData !== 'object') return null;
  const row = resultData as AccessRequestApiItem;
  const accessRequestId = Number(row.accessRequestId);
  if (!Number.isFinite(accessRequestId) || accessRequestId <= 0) return null;
  return {
    accessRequestId,
    organizationId: Number(row.organizationId) || 0,
    organizationName: String(row.organizationName ?? ''),
    requesterName: String(row.requesterName ?? ''),
    requesterEmail: String(row.requesterEmail ?? ''),
    productId: String(row.productId ?? ''),
    productName: String(row.productName ?? ''),
    status: normalizeRequestStatus(row.status),
    submittedAt: String(row.submittedAt ?? ''),
    timeline: normalizeTimeline(row.timeline),
    comments: Array.isArray(row.comments) ? row.comments : [],
  };
};

export const normalizeAccessRequestList = (resultData: unknown): AccessRequestApiItem[] => {
  if (!Array.isArray(resultData)) return [];
  return resultData.map((row) => normalizeAccessRequest(row)).filter((row): row is AccessRequestApiItem => row != null);
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
