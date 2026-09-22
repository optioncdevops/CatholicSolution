import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { TextareaField } from '@app/components/formControls';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@/modules/authentication/hooks/useFeatureAccessLevel';
import { getAcutisPublicUrl } from '@app/config/gateway';
import { formatDateTime } from '../../../utils/formatDate';

const PRODUCT_LOGO_PUBLIC_DIR = '/Acutis/Attachment/Products';
const resolveLogoUrl = (logoName?: string): string | undefined => {
  if (!logoName || !logoName.trim()) return undefined;
  return getAcutisPublicUrl(`${PRODUCT_LOGO_PUBLIC_DIR}/${logoName.trim()}`);
};
import { approveProductRequest, getProductRequestById, rejectProductRequest } from '../../services/productRequestsService';
import type { ProductRequestApiItem, ProductRequestReviewFormValues } from '../../types/productRequestsTypes';
import { normalizeProductRequest } from '../../utils/productRequestsHelpers';
import { productRequestReviewDefaultValues, productRequestReviewRules } from '../../validator/ProductRequestsValidator';

type ProductRequestReviewModalProps = {
  productRequestId: number | null;
  onClose: () => void;
  onResolved: () => Promise<void> | void;
};

const ProductRequestReviewModal = ({ productRequestId, onClose, onResolved }: ProductRequestReviewModalProps) => {
  //#region Hooks
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel('/admin/product-requests');
  const isReadOnly = accessLevel === 'readOnly';
  //#endregion

  //#region States
  const [detail, setDetail] = useState<ProductRequestApiItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset, getValues } = useForm<ProductRequestReviewFormValues>({
    defaultValues: productRequestReviewDefaultValues,
    mode: 'onChange',
  });
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!productRequestId) {
        if (!cancelled) {
          setDetail(null);
          reset(productRequestReviewDefaultValues);
        }
        return;
      }

      setLoading(true);
      try {
        const { resultData } = await getProductRequestById(productRequestId);
        if (cancelled) return;
        setDetail(normalizeProductRequest(resultData));
        reset(productRequestReviewDefaultValues);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading product request:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load product request.', 'error');
        setDetail(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productRequestId, reset, showToast]);
  //#endregion

  //#region Handlers
  const handleClose = () => {
    reset(productRequestReviewDefaultValues);
    onClose();
  };

  const onInvalid = (formErrors: any) => {
    const messages = Object.values(formErrors).map((error: any) => error?.message).filter(Boolean);
    showToast(messages.length > 0 ? messages : ['Please fill in the required fields.'], 'error');
  };

  const resolve = async (decision: 'approved' | 'rejected') => {
    if (!detail || detail.status !== 'pending' || isReadOnly) return;
    const decisionRemarks = getValues('decisionRemarks').trim();
    setSaving(true);
    try {
      const action = decision === 'approved' ? approveProductRequest : rejectProductRequest;
      await action({ productRequestId: detail.productRequestId, decisionRemarks: decisionRemarks || undefined });
      showToast(`Successfully ${decision} this product suggestion.`);
      await onResolved();
      handleClose();
    } catch (error) {
      console.error('Error updating product request:', error);
      showToast(typeof error === 'string' ? error : 'Failed to update product request.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  const isOpen = Boolean(productRequestId);
  const canResolve = detail?.status === 'pending' && !isReadOnly;

  return (
    <BaseModal
      id="dlgProductRequestReview"
      isOpen={isOpen}
      title={detail ? detail.productName : 'Product suggestion'}
      onClose={handleClose}
      size="sm"
      footer={canResolve ? (
        <>
          <CommonButton id="btnRejectProductRequest" variant="danger" size="sm" disabled={saving || loading} onClick={handleSubmit(() => void resolve('rejected'), onInvalid)}>Reject</CommonButton>
          <CommonButton id="btnApproveProductRequest" variant="primary" size="sm" intent="save" loading={saving} disabled={saving || loading} onClick={handleSubmit(() => void resolve('approved'), onInvalid)}>Approve</CommonButton>
        </>
      ) : undefined}
    >
      {loading && !detail ? <p className="text-sm text-[var(--text-muted)]">Loading suggestion…</p> : null}
      {detail ? (
        <div className="flex flex-col gap-4">
          {isReadOnly ? <ReadOnlyBanner featureName="Product Requests" /> : null}

          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Proposed Product</p>
            <div className="mt-1 flex items-center gap-2">
              {resolveLogoUrl(detail.logoName) ? (
                <img src={resolveLogoUrl(detail.logoName)} alt="" className="size-8 shrink-0 rounded-lg border border-[var(--line-soft)] object-contain p-1" />
              ) : null}
              <p className="text-sm font-bold text-[var(--text-primary)]">{detail.productName}</p>
            </div>
            {detail.subCategoryName ? <p className="text-xs text-[var(--text-muted)]">{detail.subCategoryName}</p> : null}
            {detail.prodDescription ? <p className="mt-2 text-xs text-[var(--text-secondary)]">{detail.prodDescription}</p> : null}
            {detail.externalPageUrl ? <p className="mt-2 text-xs text-[var(--text-muted)]">{detail.externalPageUrl}</p> : null}
            {detail.features.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detail.features.map((feature) => (
                  <span key={feature} className="rounded-md border border-[var(--line-soft)] bg-[var(--surface-muted)] px-2 py-1 text-[10px] font-bold text-[var(--text-secondary)]">{feature}</span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Submitted By</p>
            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">{detail.requesterName}</p>
            <p className="text-xs text-[var(--text-muted)]">{detail.requesterEmail}</p>
            {detail.organizationName ? <p className="mt-1 text-xs text-[var(--text-muted)]">{detail.organizationName}</p> : null}
            <p className="mt-2 text-xs text-[var(--text-muted)]">Submitted {formatDateTime(detail.insertedDate)}</p>
          </div>

          {detail.status !== 'pending' ? (
            <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">Decision</p>
              <p className="mt-1 text-sm font-bold capitalize text-[var(--text-primary)]">{detail.status}</p>
              {detail.reviewedDate ? <p className="text-xs text-[var(--text-muted)]">{formatDateTime(detail.reviewedDate)}</p> : null}
              {detail.decisionRemarks ? <p className="mt-1 text-xs italic text-[var(--text-secondary)]">{detail.decisionRemarks}</p> : null}
            </div>
          ) : null}

          {canResolve ? (
            <TextareaField
              control={control}
              name="decisionRemarks"
              label="Remarks"
              placeholder="Optional note for the requester"
              autoFocus
              optional
              rows={3}
              maxLength={500}
              rules={productRequestReviewRules.decisionRemarks}
              disabled={saving}
            />
          ) : null}
        </div>
      ) : null}
    </BaseModal>
  );
  //#endregion
};

export default ProductRequestReviewModal;
