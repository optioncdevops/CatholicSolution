import { useEffect, useState } from 'react';
import { useForm} from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { InputField, TextareaField } from '@app/components/formControls';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { getAccessRequestById, updateAccessRequestStatus } from '../../services/requestsService';
import type { AccessRequestApiItem, AccessRequestReviewFormValues, RequestResolveAction } from '../../types/requestsTypes';
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
  const { control, reset, getValues } = useForm<AccessRequestReviewFormValues>({
    defaultValues: accessRequestReviewDefaultValues,
    mode: 'onChange',
  });
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

  const resolve = async (status: RequestResolveAction) => {
    if (!detail || !ALLOWED_RESOLVE_STATUSES.includes(status) || isReadOnly) return;
    const note = getValues('note').trim();
    setSaving(true);
    try {
      // Send to Vendor emails the request details to the product's contact user first; the backend
      // only moves the request to Sent to vendor once that email has gone out (a missing contact user
      // or a mail failure comes back as an error and the request stays Requested).
      await updateAccessRequestStatus({
        accessRequestId: detail.accessRequestId,
        accessRequestProductId: detail.accessRequestProductId || accessRequestProductId,
        status,
        note: note || undefined,
      });
      const successMessage: Record<RequestResolveAction, string> = {
        'sent-to-vendor': 'Request details emailed to the product contact. The request is now Sent to vendor.',
        approved: 'Successfully approved this access request.',
        rejected: 'Successfully rejected this access request.',
      };
      showToast(successMessage[status]);
      await onResolved();
      handleClose();
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
  // Requested -> Send to Vendor / Request Info / Reject; Sent to vendor -> Approve / Reject.
  const isRequested = detail?.status === 'pending' && !isReadOnly;
  const isWithVendor = detail?.status === 'sent-to-vendor' && !isReadOnly;
  // Send to Vendor needs a contact user on the product - that's who the email goes to.
  const hasProductContact = Boolean(detail?.productContactEmail);

  return (
    <BaseModal
      id="dlgAccessRequestReview"
      isOpen={isOpen}
      title={detail ? `${detail.requesterName}'s request` : 'Access request'}
      onClose={handleClose}
      size="lg"
      footer={isRequested || isWithVendor ? (
        <>
          <CommonButton id="btnRejectAccessRequest" variant="danger" size="sm" disabled={saving || loading} onClick={() => void resolve('rejected')}>Reject</CommonButton>
          {isRequested ? (
            <>
              <CommonButton id="btnSendToVendorAccessRequest" variant="primary" size="sm" intent="save" loading={saving} disabled={saving || loading || !hasProductContact} onClick={() => void resolve('sent-to-vendor')}>Send to Vendor</CommonButton>
            </>
          ) : (
            <CommonButton id="btnApproveAccessRequest" variant="primary" size="sm" intent="save" loading={saving} disabled={saving || loading} onClick={() => void resolve('approved')}>Approve</CommonButton>
          )}
        </>
      ) : undefined}
    >
      {loading && !detail ? <p className="text-sm text-[var(--text-muted)]">Loading request…</p> : null}
      {detail ? (
        <div className="flex flex-col gap-4">
          {isReadOnly ? <ReadOnlyBanner featureName="Requests" /> : null}
          {detail.productName ? <p className="-mt-2 text-xs text-[var(--text-muted)]">{detail.productName}</p> : null}
          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Requester</p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                { label: 'Name', value: detail.requesterName },
                { label: 'Email', value: detail.requesterEmail },
                { label: 'Organization', value: detail.organizationName },
                { label: 'Organization type', value: detail.organizationType },
                {
                  label: 'Address',
                  value: [detail.address, [detail.city, detail.state].filter(Boolean).join(', '), detail.zip].filter(Boolean).join(' · '),
                },
                { label: 'Phone', value: detail.phone },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-xs text-[var(--text-faint)]">{item.label}</dt>
                  <dd className="mt-0.5 break-words text-sm text-[var(--text-primary)]">{item.value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>

          {detail.status === 'pending' || detail.status === 'sent-to-vendor' ? (
            <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Product User</p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <InputField
                  id="txtAccessRequestProductContactName"
                  label="Name"
                  value={detail.productContactName || ''}
                  onChange={() => undefined}
                  placeholder="No contact user set on this product"
                  disabled
                />
                <InputField
                  id="txtAccessRequestProductContactEmail"
                  label="Email"
                  type="email"
                  value={detail.productContactEmail || ''}
                  onChange={() => undefined}
                  placeholder="No contact user set on this product"
                  disabled
                />
              </div>
              {!hasProductContact && detail.status === 'pending' ? (
                <p className="mt-2 text-xs text-[var(--error)]">Set a Contact Person on this product before sending the request to the vendor.</p>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Status Timeline</p>
            {detail.timeline.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No timeline entries yet.</p>
            ) : (
              <ol className="flex flex-col gap-3 border-l-2 border-[var(--line)] pl-3.5">
                {detail.timeline.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="relative">
                    <span className="absolute -left-[19px] top-1 size-2.5 rounded-full bg-[var(--secondary)]" aria-hidden="true" />
                    <p className="text-xs font-bold capitalize text-[var(--text-primary)]">{entry.status === 'pending' ? 'requested' : String(entry.status).replace(/-/g, ' ')}</p>
                    <p className="text-xs text-[var(--text-muted)]">{entry.actor} &middot; {formatDate(entry.at)}</p>
                    {entry.note ? <p className="mt-0.5 text-xs italic text-[var(--text-secondary)]">{entry.note}</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {isRequested || isWithVendor ? (
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
