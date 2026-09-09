import { useEffect, useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { Pencil, Save, X } from 'lucide-react';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Dropdown, InputField } from '@app/components/formControls';
import { StatusBadge } from '@app/components/Badge';
import { getOrganizationUsers, updateOrganization } from '../../services/organizationsService';
import type { OrganizationApiItem, OrganizationFormValues, OrganizationUserApiItem } from '../../types/organizationTypes';
import { composeOrganizationAddress, formatOrgCode, ORG_TYPE_OPTIONS, orgTypeLabel } from '../../utils/organizationHelpers';
import { organizationRules } from '../../validator/OrganizationValidator';
import { formatDate } from '@/modules/utils/formatDate';

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <p className="mt-0.5 truncate text-[0.8125rem] font-normal text-[var(--text-primary)]">{value || '—'}</p>
    </div>
  );
}

type OrganizationProfilePanelProps = {
  organization: OrganizationApiItem;
  startInEdit: boolean;
  onSaved: () => Promise<void> | void;
};

const OrganizationProfilePanel = ({ organization, startInEdit, onSaved }: OrganizationProfilePanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [editing, setEditing] = useState(startInEdit);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<OrganizationUserApiItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset } = useForm<OrganizationFormValues>({
    defaultValues: {
      orgName: organization.orgName,
      orgStatus: organization.orgStatus,
      orgType: organization.orgType ?? '',
      contactEmail: organization.contactEmail ?? '',
      website: organization.website ?? '',
      contactPerson: organization.contactPerson ?? '',
      contactPhone: organization.contactPhone ?? '',
      address: organization.address ?? '',
      city: organization.city ?? '',
      state: organization.state ?? '',
      zip: organization.zip ?? '',
    },
    mode: 'onChange',
  });
  //#endregion

  //#region Effects
  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    void (async () => {
      setLoadingMembers(true);
      try {
        const { resultData, statusCode } = await getOrganizationUsers(organization.orgId);
        if (!cancelled) setMembers(statusCode === 204 || !Array.isArray(resultData) ? [] : resultData as OrganizationUserApiItem[]);
      } catch (error) {
        console.error('Error loading organization members:', error);
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editing, organization.orgId]);
  //#endregion

  // Contact Person is a free-text field on the backend (not a foreign key to a member), so the
  // currently-saved value is injected as a selectable option even if it no longer matches a
  // linked member — selecting it never silently disappears from the field.
  const contactPersonOptions = (() => {
    const names = new Set(members.map((member) => member.fullName).filter(Boolean));
    if (organization.contactPerson) names.add(organization.contactPerson);
    return [...names].sort((a, b) => a.localeCompare(b)).map((name) => ({ id: name, value: name }));
  })();

  //#region Handlers
  const handleEdit = () => {
    reset({
      orgName: organization.orgName,
      orgStatus: organization.orgStatus,
      orgType: organization.orgType ?? '',
      contactEmail: organization.contactEmail ?? '',
      website: organization.website ?? '',
      contactPerson: organization.contactPerson ?? '',
      contactPhone: organization.contactPhone ?? '',
      address: organization.address ?? '',
      city: organization.city ?? '',
      state: organization.state ?? '',
      zip: organization.zip ?? '',
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const onInvalid = (formErrors: FieldErrors<OrganizationFormValues>) => {
    const messages = Object.values(formErrors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));
    showToast(messages.length > 0 ? messages : ['Please fill in the required fields.'], 'error');
  };

  const onSubmit = async (values: OrganizationFormValues) => {
    setSaving(true);
    try {
      await updateOrganization({
        orgId: organization.orgId,
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
      showToast(`${values.orgName.trim()} updated.`, 'success');
      setEditing(false);
      await onSaved();
    } catch (error) {
      console.error('Error saving organization:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save organization.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  if (!editing) {
    return (
      <section className="admin-panel-card">
        <div className="admin-panel-card__header flex items-center justify-between">
          <h2 className="panel-title">Organization Profile</h2>
          <CommonButton variant="outline" size="sm" iconLeft={<Pencil size={14} />} onClick={handleEdit}>Edit</CommonButton>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-3">
          <Fact label="Org Code" value={formatOrgCode(organization.orgId)} />
          <Fact label="Organization Name" value={organization.orgName} />
          <Fact label="Organization Type" value={orgTypeLabel(organization.orgType)} />
          <Fact label="Website" value={organization.website ?? ''} />
          <Fact label="Contact Person" value={organization.contactPerson ?? ''} />
          <Fact label="Contact Number" value={organization.contactPhone ?? ''} />
          <Fact label="Contact Email" value={organization.contactEmail ?? ''} />
          <Fact label="Address" value={organization.address ?? ''} />
          <Fact label="City" value={organization.city ?? ''} />
          <Fact label="State" value={organization.state ?? ''} />
          <Fact label="ZIP" value={organization.zip ?? ''} />
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Status</p>
            <p className="mt-0.5"><StatusBadge status={organization.orgStatus} kind="organization" /></p>
            <p className="mt-0.5 text-[0.625rem] text-[var(--text-faint)]">Change status from the Organizations list</p>
          </div>
          <Fact label="Address" value={composeOrganizationAddress(organization)} />
          <Fact label="Created On" value={formatDate(organization.insertedDate)} />
          <Fact label="Last Updated" value={formatDate(organization.updatedDate ?? organization.insertedDate)} />
        </div>
      </section>
    );
  }

  return (
    <section className="admin-panel-card">
      <div className="admin-panel-card__header"><h2 className="panel-title">Edit Organization Profile</h2></div>

      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4 p-4">
        <p className="text-[0.6875rem] font-semibold text-[var(--text-faint)]">
          Contact number and contact email aren't editable here — they're carried over unchanged. Update contact person from the organization's linked members below.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <InputField control={control} name="orgName" label="Organization name" required rules={organizationRules.orgName} disabled={saving} wrapperClassName="md:col-span-12" />
          <Dropdown control={control} name="orgType" label="Organization type" placeholder="Select type" searchable={false} options={ORG_TYPE_OPTIONS} disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="website" label="Website" placeholder="example.org" rules={organizationRules.website} disabled={saving} wrapperClassName="md:col-span-4" />
          <Dropdown
            control={control} name="contactPerson" label="Contact person"
            placeholder={loadingMembers ? 'Loading members…' : 'Select contact person'}
            options={contactPersonOptions} disabled={saving || loadingMembers} wrapperClassName="md:col-span-4"
          />
          <InputField control={control} name="address" label="Address" disabled={saving} wrapperClassName="md:col-span-12" />
          <InputField control={control} name="city" label="City" disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="state" label="State" disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="zip" label="ZIP code" rules={organizationRules.zip} disabled={saving} wrapperClassName="md:col-span-4" />
        </div>

        <div className="admin-sticky-footer">
          <CommonButton type="button" variant="outline" size="sm" iconLeft={<X size={14} />} onClick={handleCancel} disabled={saving}>Cancel</CommonButton>
          <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving}>Save</CommonButton>
        </div>
      </form>
    </section>
  );
  //#endregion
};

export default OrganizationProfilePanel;
