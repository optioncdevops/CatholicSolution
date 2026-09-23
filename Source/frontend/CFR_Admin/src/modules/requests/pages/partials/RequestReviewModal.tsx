import { useCallback, useEffect, useState } from 'react';
import { useForm} from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { TextareaField } from '@app/components/formControls';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { getAccessRequestById, updateAccessRequestStatus } from '../../services/requestsService';
import type { AccessRequestApiItem, AccessRequestReviewFormValues, RequestStatus } from '../../types/requestsTypes';
import { normalizeAccessRequest } from '../../utils/requestsHelpers';
import { ALLOWED_RESOLVE_STATUSES, accessRequestReviewDefaultValues, resolveRequestStatusRules } from '../../validator/RequestsValidator';

type RequestReviewModalProps = {
  accessRequestId: number | null;
  accessRequestProductId: number | null;
  onClose: () => void;
  onResolved: () => Promise<void> | void;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}/${month}/${year} ${hours}.${minutes} ${ampm}`;
};

const RequestReviewModal = ({ accessRequestId, accessRequestProductId, onClose, onResolved }: RequestReviewModalProps) => {
  //#region Hooks
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel('/admin/requests');
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [detail, setDetail] = useState<AccessRequestApiItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset, getValues } = useForm<AccessRequestReviewFormValues>({
    defaultValues: accessRequestReviewDefaultValues,
    mode: 'onChange',
  });
  //#endregion

  //#region Functions
  const loadDetail = useCallback(async (id: number, productId: number | null) => {
    setLoading(true);
    try {
      const { resultData } = await getAccessRequestById(id, productId);
      const row = normalizeAccessRequest(resultData);
      setDetail(row);
      reset(accessRequestReviewDefaultValues);
    } catch (error) {
      console.error('Error loading access request:', error);
      showToast(typeof error === 'string' ? error : 'Failed to load access request.', 'error');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [reset, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!accessRequestId) {
        if (!cancelled) {
          setDetail(null);
          reset(accessRequestReviewDefaultValues);
        }
        return;
      }

      setLoading(true);
      try {
        const { resultData } = await getAccessRequestById(accessRequestId, accessRequestProductId);
        if (cancelled) return;
        setDetail(normalizeAccessRequest(resultData));
        reset(accessRequestReviewDefaultValues);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading access request:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load access request.', 'error');
        setDetail(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessRequestId, accessRequestProductId, reset, showToast]);
  //#endregion

  //#region Handlers
  const handleClose = () => {
    reset(accessRequestReviewDefaultValues);
    onClose();
  };

  const onInvalid = (formErrors: any) => {
    const messages = Object.entries(formErrors).map(([key, error]: [string, any]) => {
      if (error?.message === 'This field is required') {
        let fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
        if (key === 'eMail' || key === 'email') fieldName = 'email address';
        if (key === 'roleId') fieldName = 'role';
        if (key === 'isActive') fieldName = 'status';
        if (key === 'isLocked') fieldName = 'locked';
        fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return `${fieldName} is required.`;
      }
      return error?.message;
    }).filter(Boolean);
    showToast(messages.length > 0 ? messages : ['Please fill in the required fields.'], 'error');
  };

  const resolve = async (status: RequestStatus) => {
    if (!detail || !ALLOWED_RESOLVE_STATUSES.includes(status) || isReadOnly) return;
    const note = getValues('note').trim();
    setSaving(true);
    try {
      await updateAccessRequestStatus({
        accessRequestId: detail.accessRequestId,
        accessRequestProductId: detail.accessRequestProductId || accessRequestProductId,
        status,
        note: note || (status === 'info-requested' ? 'More information requested.' : undefined),
      });
      const verb = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'sent an information request for';
      showToast(`Successfully ${verb} this access request.`);
      await onResolved();
      if (status === 'info-requested') {
        await loadDetail(detail.accessRequestId, detail.accessRequestProductId || accessRequestProductId);
      } else {
        handleClose();
      }
    } catch (error) {
      console.error('Error updating access request:', error);
      showToast(typeof error === 'string' ? error : 'Failed to update access request.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  const isOpen = Boolean(accessRequestId);
  const canResolve = (detail?.status === 'pending' || detail?.status === 'info-requested') && !isReadOnly;

  return (
    <BaseModal
      id="dlgAccessRequestReview"
      isOpen={isOpen}
      title={detail ? `${detail.requesterName}'s request` : 'Access request'}
      onClose={handleClose}
      size="sm"
      footer={canResolve ? (
        <>
          <CommonButton id="btnRejectAccessRequest" variant="danger" size="sm" disabled={saving || loading} onClick={() => void resolve('rejected')}>Reject</CommonButton>
          <CommonButton id="btnRequestInfoAccessRequest" variant="outline" size="sm" disabled={saving || loading} onClick={handleSubmit(() => void resolve('info-requested'), onInvalid)}>Request Info</CommonButton>
          <CommonButton id="btnApproveAccessRequest" variant="primary" size="sm" intent="save" loading={saving} disabled={saving || loading} onClick={() => void resolve('approved')}>Approve</CommonButton>
        </>
      ) : undefined}
    >
      {loading && !detail ? <p className="text-sm text-[var(--text-muted)]">Loading request…</p> : null}
      {detail ? (
        <div className="flex flex-col gap-4">
          {isReadOnly ? <ReadOnlyBanner featureName="Requests" /> : null}
          {detail.productName ? <p className="-mt-2 text-xs text-[var(--text-muted)]">{detail.productName}</p> : null}
          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Requester</p>
            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{detail.requesterName}</p>
            <p className="text-xs text-[var(--text-muted)]">{detail.requesterEmail}</p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{detail.organizationName || '—'}</p>
            {detail.organizationType ? <p className="text-xs text-[var(--text-muted)]">{detail.organizationType}</p> : null}
            {detail.address || detail.city || detail.state || detail.zip ? (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {[detail.address, [detail.city, detail.state].filter(Boolean).join(', '), detail.zip].filter(Boolean).join(' · ')}
              </p>
            ) : null}
            {detail.phone ? <p className="text-xs text-[var(--text-muted)]">{detail.phone}</p> : null}
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Status Timeline</p>
            {detail.timeline.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No timeline entries yet.</p>
            ) : (
              <ol className="flex flex-col gap-3 border-l-2 border-[var(--line)] pl-3.5">
                {detail.timeline.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="relative">
                    <span className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-[var(--secondary)]" aria-hidden="true" />
                    <p className="text-xs font-bold capitalize text-[var(--text-primary)]">{String(entry.status).replace('-', ' ')}</p>
                    <p className="text-xs text-[var(--text-muted)]">{entry.actor} &middot; {formatDate(entry.at)}</p>
                    {entry.note ? <p className="mt-0.5 text-xs italic text-[var(--text-secondary)]">{entry.note}</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {canResolve ? (
            <TextareaField
              control={control}
              name="note"
              label="Note"
              placeholder="Enter note"
              autoFocus
              optional
              rows={3}
              maxLength={500}
              rules={resolveRequestStatusRules.note}
              disabled={saving}
            />
          ) : null}
        </div>
      ) : null}
    </BaseModal>
  );
  //#endregion
};

export default RequestReviewModal;
