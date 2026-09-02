import { useCallback, useEffect, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { TextareaField } from '@app/components/formControls';
import { useToast } from '@shared/app/components/ToastProvider';
import { getAccessRequestById, updateAccessRequestStatus } from '../../services/requestsService';
import type { AccessRequestApiItem, AccessRequestReviewFormValues, RequestStatus } from '../../types/requestsTypes';
import { normalizeAccessRequest } from '../../utils/requestsHelpers';
import { ALLOWED_RESOLVE_STATUSES, accessRequestReviewDefaultValues, resolveRequestStatusRules } from '../../validator/RequestsValidator';

type RequestReviewModalProps = {
  accessRequestId: number | null;
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

const RequestReviewModal = ({ accessRequestId, onClose, onResolved }: RequestReviewModalProps) => {
  //#region Hooks
  const { showToast } = useToast();
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
  const loadDetail = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const { resultData } = await getAccessRequestById(id);
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
        const { resultData } = await getAccessRequestById(accessRequestId);
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
  }, [accessRequestId, reset, showToast]);
  //#endregion

  //#region Handlers
  const handleClose = () => {
    reset(accessRequestReviewDefaultValues);
    onClose();
  };

  const onInvalid = (formErrors: FieldErrors<AccessRequestReviewFormValues>) => {
    const messages = Object.values(formErrors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));
    showToast(messages.length > 0 ? messages : ['Please fill in the required fields.'], 'error');
  };

  const resolve = async (status: RequestStatus) => {
    if (!detail || !ALLOWED_RESOLVE_STATUSES.includes(status)) return;
    const note = getValues('note').trim();
    setSaving(true);
    try {
      await updateAccessRequestStatus({
        accessRequestId: detail.accessRequestId,
        status,
        note: note || (status === 'info-requested' ? 'More information requested.' : undefined),
      });
      const verb = status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Requested more information for';
      showToast(`${verb} ${detail.productName} request from ${detail.requesterName}.`);
      await onResolved();
      if (status === 'info-requested') {
        await loadDetail(detail.accessRequestId);
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
  const canResolve = detail?.status === 'pending' || detail?.status === 'info-requested';

  return (
    <BaseModal
      isOpen={isOpen}
      title={detail ? `${detail.requesterName}'s request` : 'Access request'}
      onClose={handleClose}
      size="sm"
      footer={canResolve ? (
        <>
          <CommonButton variant="danger" size="sm" disabled={saving || loading} onClick={() => void resolve('rejected')}>Reject</CommonButton>
          <CommonButton variant="outline" size="sm" disabled={saving || loading} onClick={handleSubmit(() => void resolve('info-requested'), onInvalid)}>Request Info</CommonButton>
          <CommonButton variant="primary" size="sm" intent="save" loading={saving} disabled={saving || loading} onClick={() => void resolve('approved')}>Approve</CommonButton>
        </>
      ) : undefined}
    >
      {loading && !detail ? <p className="text-sm text-[var(--text-muted)]">Loading request…</p> : null}
      {detail ? (
        <div className="flex flex-col gap-4">
          {detail.productName ? <p className="-mt-2 text-xs text-[var(--text-muted)]">{detail.productName}</p> : null}
          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Requester</p>
            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{detail.requesterName}</p>
            <p className="text-xs text-[var(--text-muted)]">{detail.requesterEmail}</p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">{detail.organizationName || '—'}</p>
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
