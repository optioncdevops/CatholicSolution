import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { Dropdown } from '@app/components/formControls';
import { useToast } from '@shared/app/components/ToastProvider';
import { assignOrganizationProduct, getAssignableOrganizationProducts } from '../../services/organizationsService';
import type { AssignableProductApiItem } from '../../types/organizationTypes';

type AssignProductFormValues = {
  productId: string;
};

type AssignOrganizationProductModalProps = {
  isOpen: boolean;
  orgId: number;
  orgName: string;
  onClose: () => void;
  onAssigned: () => Promise<void> | void;
};

// Assigning a never-before-mapped product is equivalent to activating it — this is the "assign
// new app" entry point; reactivating a previously deactivated one happens inline from the
// Products table's Activate action instead (its product id is already known there).
const AssignOrganizationProductModal = ({ isOpen, orgId, orgName, onClose, onAssigned }: AssignOrganizationProductModalProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [options, setOptions] = useState<AssignableProductApiItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset } = useForm<AssignProductFormValues>({
    defaultValues: { productId: '' },
    mode: 'onChange',
  });
  const selectedProductId = useWatch({ control, name: 'productId' });
  //#endregion

  //#region Functions
  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const { resultData } = await getAssignableOrganizationProducts(orgId);
      setOptions(Array.isArray(resultData) ? resultData as AssignableProductApiItem[] : []);
    } catch (error) {
      console.error('Error loading assignable products:', error);
      showToast('Failed to load available apps.', 'error');
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    if (!isOpen) return;
    reset({ productId: '' });
    void loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload each time the modal opens for this org
  }, [isOpen, orgId]);
  //#endregion

  //#region Handlers
  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const onSubmit = async (values: AssignProductFormValues) => {
    const product = options.find((option) => String(option.productId) === values.productId);
    if (!product) return;

    setSaving(true);
    try {
      await assignOrganizationProduct({ orgId, productId: product.productId });
      showToast(`${product.productName} activated for ${orgName}.`, 'success');
      onClose();
      await onAssigned();
    } catch (error) {
      console.error('Error assigning product:', error);
      showToast(typeof error === 'string' ? error : 'Failed to update application access.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign App"
      size="sm"
      footer={(
        <>
          <CommonButton variant="outline" onClick={handleClose} disabled={saving}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit(onSubmit)} loading={saving} disabled={saving || !selectedProductId || options.length === 0}>Activate</CommonButton>
        </>
      )}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Dropdown
          control={control}
          name="productId"
          label="App"
          placeholder={loadingOptions ? 'Loading apps…' : 'Select app'}
          searchable
          clearable={false}
          disabled={saving || loadingOptions || options.length === 0}
          options={options.map((option) => ({ id: String(option.productId), value: option.subCategoryName ? `${option.productName} (${option.subCategoryName})` : option.productName }))}
        />
        {!loadingOptions && options.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">Every available app is already assigned to {orgName}.</p>
        ) : null}
      </form>
    </BaseModal>
  );
  //#endregion
};

export default AssignOrganizationProductModal;
