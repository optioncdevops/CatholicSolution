import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { CommonButton } from '@app/components/buttons';
import { Dropdown, InputField, MandatoryIndicator } from '@app/components/formControls';
import { createOrganization } from '../services/organizationsService';
import type { OrganizationFormValues } from '../types/organizationTypes';
import { ORG_STATUS_OPTIONS, ORG_TYPE_OPTIONS, US_STATE_OPTIONS } from '../utils/organizationHelpers';
import { organizationDefaultValues, organizationRules } from '../validator/OrganizationValidator';

const OrganizationAddPage = () => {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel('/admin/organizations');
  const isReadOnly = accessLevel === 'readOnly';
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

  const onSubmit = async (values: OrganizationFormValues) => {
    if (isReadOnly) return;
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

      {isReadOnly ? <ReadOnlyBanner featureName="Organizations" /> : null}

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
            disabled={saving || isReadOnly}
            wrapperClassName="md:col-span-12"
          />
          <Dropdown control={control} name="orgType" label="Organization type" placeholder="Select type" required searchable={false} clearable={false} rules={organizationRules.orgType} options={ORG_TYPE_OPTIONS} disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="website" label="Website" placeholder="example.org" rules={organizationRules.website} disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <Dropdown control={control} name="orgStatus" label="Status" searchable={false} clearable={false} options={ORG_STATUS_OPTIONS} disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="contactPerson" label="Contact person" placeholder="Enter contact person" disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="contactPhone" label="Contact number" type="tel" placeholder="Enter contact number" rules={organizationRules.contactPhone} disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="contactEmail" label="Contact email" type="email" placeholder="Enter contact email" rules={organizationRules.contactEmail} disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="address" label="Address" placeholder="Street address" disabled={saving || isReadOnly} wrapperClassName="md:col-span-12" />
          <InputField control={control} name="city" label="City" placeholder="Enter city" disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <Dropdown control={control} name="state" label="State" placeholder="Select state" searchable options={US_STATE_OPTIONS} disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="zip" label="ZIP code" placeholder="Enter ZIP code" rules={organizationRules.zip} disabled={saving || isReadOnly} wrapperClassName="md:col-span-4" />
        </div>

        <div className="admin-sticky-footer">
          <CommonButton type="button" variant="outline" size="sm" iconLeft={<X size={14} />} onClick={navigateToList} disabled={saving}>Cancel</CommonButton>
          {!isReadOnly && (
            <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving}>Save</CommonButton>
          )}
        </div>
      </form>
    </div>
  );
  //#endregion
};

export default OrganizationAddPage;
