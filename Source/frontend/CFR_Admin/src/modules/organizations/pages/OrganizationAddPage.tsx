import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Dropdown, InputField, MandatoryIndicator } from '@app/components/formControls';
import { createOrganization } from '../services/organizationsService';
import type { OrganizationFormValues } from '../types/organizationTypes';
import { ORG_STATUS_OPTIONS, ORG_TYPE_OPTIONS } from '../utils/organizationHelpers';
import { organizationDefaultValues, organizationRules } from '../validator/OrganizationValidator';

const OrganizationAddPage = () => {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [saving, setSaving] = useState(false);
  //#endregion

  //#region Form
  const { control, handleSubmit } = useForm<OrganizationFormValues>({
    defaultValues: organizationDefaultValues,
    mode: 'onChange',
  });
  //#endregion

  //#region Functions
  const navigateToList = () => {
    navigate('/admin/organizations', { replace: true });
  };
  //#endregion

  //#region Handlers
  const onInvalid = (formErrors: FieldErrors<OrganizationFormValues>) => {
    const messages = Object.values(formErrors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));
    showToast(messages.length > 0 ? messages : ['Please fill in the required fields.'], 'error');
  };

  const onSubmit = async (values: OrganizationFormValues) => {
    setSaving(true);
    try {
      await createOrganization({
        orgName: values.orgName.trim(),
        orgStatus: values.orgStatus,
        orgType: values.orgType,
        contactEmail: values.contactEmail.trim(),
        website: values.website.trim(),
        contactPerson: values.contactPerson.trim(),
        contactPhone: values.contactPhone.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        zip: values.zip.trim(),
      });
      showToast(`${values.orgName.trim()} created.`, 'success');
      navigateToList();
    } catch (error) {
      console.error('Error creating organization:', error);
      showToast(typeof error === 'string' ? error : 'Failed to create organization.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title="Add Organization" action={<MandatoryIndicator variant="brand" />} />

      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <InputField
            control={control}
            name="orgName"
            label="Organization name"
            placeholder="Enter organization name"
            autoFocus
            required
            rules={organizationRules.orgName}
            disabled={saving}
            wrapperClassName="md:col-span-12"
          />
          <Dropdown control={control} name="orgType" label="Organization type" placeholder="Select type" searchable={false} options={ORG_TYPE_OPTIONS} disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="website" label="Website" placeholder="example.org" rules={organizationRules.website} disabled={saving} wrapperClassName="md:col-span-4" />
          <Dropdown control={control} name="orgStatus" label="Status" searchable={false} clearable={false} options={ORG_STATUS_OPTIONS} disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="contactPerson" label="Contact person" placeholder="Enter contact person" disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="contactPhone" label="Contact number" type="tel" placeholder="Enter contact number" rules={organizationRules.contactPhone} disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="contactEmail" label="Contact email" type="email" placeholder="Enter contact email" rules={organizationRules.contactEmail} disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="address" label="Address" placeholder="Street address" disabled={saving} wrapperClassName="md:col-span-12" />
          <InputField control={control} name="city" label="City" placeholder="Enter city" disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="state" label="State" placeholder="Enter state" disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="zip" label="ZIP code" placeholder="Enter ZIP code" rules={organizationRules.zip} disabled={saving} wrapperClassName="md:col-span-4" />
        </div>

        <div className="admin-sticky-footer">
          <CommonButton type="button" variant="outline" size="sm" iconLeft={<X size={14} />} onClick={navigateToList} disabled={saving}>Cancel</CommonButton>
          <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving}>Save</CommonButton>
        </div>
      </form>
    </div>
  );
  //#endregion
};

export default OrganizationAddPage;
