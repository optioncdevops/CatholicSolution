import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { Dropdown, InputField } from '@app/components/formControls';
import { useToast } from '@shared/app/components/ToastProvider';
import { updateLiveOrganization } from '../../services/liveOrganizationsService';
import type { LiveOrganizationApiItem, LiveOrganizationFormValues } from '../../types/liveOrganizationTypes';
import { ORG_STATUS_OPTIONS } from '../../utils/liveOrganizationHelpers';
import { liveOrganizationDefaultValues, liveOrganizationRules } from '../../validator/LiveOrganizationValidator';

type LiveOrganizationFormModalProps = {
  open: boolean;
  organization: LiveOrganizationApiItem | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

const LiveOrganizationFormModal = ({ open, organization, onClose, onSaved }: LiveOrganizationFormModalProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset } = useForm<LiveOrganizationFormValues>({
    defaultValues: liveOrganizationDefaultValues,
    mode: 'onChange',
  });
  //#endregion

  // Seed the form from the organization being edited (or defaults) each time the modal opens.
  // Adjusted during render, not in an effect: an effect body would paint stale values for one
  // frame before resetting, which is visible when reopening the modal for a different row.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFormError(null);
      reset(organization
        ? {
          orgName: organization.orgName,
          orgStatus: organization.orgStatus,
          contactEmail: organization.contactEmail ?? '',
          website: organization.website ?? '',
          contactPerson: organization.contactPerson ?? '',
          contactPhone: organization.contactPhone ?? '',
        }
        : liveOrganizationDefaultValues);
    }
  }

  //#region Functions
  const handleClose = () => {
    setFormError(null);
    onClose();
  };
  //#endregion

  //#region Handlers
  const onSubmit = async (values: LiveOrganizationFormValues) => {
    if (!organization) return;
    setSaving(true);
    setFormError(null);
    try {
      await updateLiveOrganization({
        orgId: organization.orgId,
        orgName: values.orgName.trim(),
        orgStatus: values.orgStatus,
        contactEmail: values.contactEmail.trim(),
        website: values.website.trim(),
        contactPerson: values.contactPerson.trim(),
        contactPhone: values.contactPhone.trim(),
      });
      showToast(`${values.orgName.trim()} updated.`, 'success');
      handleClose();
      await onSaved();
    } catch (error) {
      console.error('Error saving organization:', error);
      const message = typeof error === 'string' ? error : 'Failed to save organization.';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <BaseModal
      isOpen={open}
      onClose={handleClose}
      title="Edit Organization"
      size="md"
      showMandatory
      footer={(
        <>
          <CommonButton variant="outline" onClick={handleClose} disabled={saving}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit(onSubmit)} loading={saving} disabled={saving}>Save</CommonButton>
        </>
      )}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {formError ? <p className="col-span-full text-xs font-semibold text-[var(--error)]">{formError}</p> : null}
        <InputField control={control} name="orgName" label="Organization name" required rules={liveOrganizationRules.orgName} disabled={saving} wrapperClassName="sm:col-span-2" />
        <InputField control={control} name="website" label="Website" placeholder="example.org" rules={liveOrganizationRules.website} disabled={saving} />
        <InputField control={control} name="contactPerson" label="Contact person" disabled={saving} />
        <InputField control={control} name="contactPhone" label="Contact number" type="tel" disabled={saving} />
        <InputField control={control} name="contactEmail" label="Contact email" type="email" rules={liveOrganizationRules.contactEmail} disabled={saving} />
        <Dropdown control={control} name="orgStatus" label="Status" searchable={false} clearable={false} options={ORG_STATUS_OPTIONS} disabled={saving} />
      </form>
    </BaseModal>
  );
  //#endregion
};

export default LiveOrganizationFormModal;
