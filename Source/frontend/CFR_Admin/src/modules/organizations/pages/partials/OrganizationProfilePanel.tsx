import { useEffect, useState } from 'react';
import { useForm} from 'react-hook-form';
import { Pencil, Save, X } from 'lucide-react';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton } from '@app/components/buttons';
import { Dropdown, InputField } from '@app/components/formControls';
import { StatusBadge } from '@app/components/Badge';
import { confirmDiscardChanges } from '@/modules/lib/confirm';
import { getDioceses, getOrganizationUsers, updateOrganization } from '../../services/organizationsService';
import type { OrganizationApiItem, OrganizationFormValues, OrganizationUserApiItem } from '../../types/organizationTypes';
import { composeOrganizationAddress, formatOrgCode, ORG_TYPE_OPTIONS, orgTypeLabel, stateLabel, US_STATE_OPTIONS } from '../../utils/organizationHelpers';
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
  readOnly?: boolean;
};

const OrganizationProfilePanel = ({ organization, startInEdit, onSaved, readOnly = false }: OrganizationProfilePanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [editing, setEditing] = useState(startInEdit && !readOnly);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<OrganizationUserApiItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [dioceses, setDioceses] = useState<{ id: number; value: string }[]>([]);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<OrganizationFormValues>({
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
      dioceseId: organization.dioceseId ?? null,
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

  useEffect(() => {
    let active = true;
    const fetchDioceses = async () => {
      try {
        const res = await getDioceses();
        if (active) {
          const formatted = (res.resultData || []).map((d) => ({
            id: d.dioceseId,
            value: d.dioceseName,
          }));
          setDioceses(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch dioceses', err);
      }
    };
    void fetchDioceses();
    return () => { active = false; };
  }, []);
  //#endregion

  // Contact Person is a free-text field on the backend (not a foreign key to a member), so the
  // currently-saved value is injected as a selectable option even if it no longer matches a
  // linked member — selecting it never silently disappears from the field.
  const contactPersonOptions = (() => {
    const names = new Set(members.map((member) => member.fullName).filter(Boolean));
    if (organization.contactPerson) names.add(organization.contactPerson);
    return [...names].sort((a, b) => a.localeCompare(b)).map((name) => ({ id: name, value: name }));
  })();

  const getDioceseName = (id: number | null) => {
    if (!id) return '';
    const found = dioceses.find((d) => d.id === id);
    return found ? found.value : String(id);
  };

  //#region Handlers
  const handleEdit = () => {
    if (readOnly) return;
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
      dioceseId: organization.dioceseId ?? null,
    });
    setEditing(true);
  };

  const handleCancel = async () => {
    if (isDirty) {
      const confirmed = await confirmDiscardChanges();
      if (!confirmed) return;
    }
    setEditing(false);
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

  const onSubmit = async (values: OrganizationFormValues) => {
    if (readOnly) return;
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
        dioceseId: values.dioceseId,
      });
      showToast('Organization updated successfully.', 'success');
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
          <CommonButton variant="outline" size="sm" iconLeft={<Pencil size={14} />} onClick={handleEdit} disabled={readOnly}>Edit</CommonButton>
        </div>

        {readOnly ? <div className="px-4 pt-4"><ReadOnlyBanner featureName="Organizations" /></div> : null}

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-3">
          <Fact label="Org Code" value={formatOrgCode(organization.orgId)} />
          <Fact label="Organization Name" value={organization.orgName} />
          <Fact label="Organization Type" value={orgTypeLabel(organization.orgType)} />
          <Fact label="Website" value={organization.website ?? ''} />
          <Fact label="Contact Person" value={organization.contactPerson ?? ''} />
          <Fact label="Contact Number" value={organization.contactPhone ?? ''} />
          <Fact label="Contact Email" value={organization.contactEmail ?? ''} />
          <Fact label="Address" value={composeOrganizationAddress(organization)} />
          <Fact label="City" value={organization.city ?? ''} />
          <Fact label="State" value={stateLabel(organization.state)} />
          <Fact label="ZIP" value={organization.zip ?? ''} />
          <Fact label="Diocese" value={getDioceseName(organization.dioceseId)} />
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Status</p>
            <p className="mt-0.5"><StatusBadge status={organization.orgStatus} kind="organization" /></p>
          </div>
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
          Organization name, organization type, contact number, and contact email aren't editable here — they're carried over unchanged. Update contact person from the organization's linked members below.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <InputField control={control} name="orgName" label="Organization name" required rules={organizationRules.orgName} disabled wrapperClassName="md:col-span-8" />
          <Dropdown control={control} name="orgType" label="Organization type" placeholder="Select type" required searchable={false} clearable={false} rules={organizationRules.orgType} options={ORG_TYPE_OPTIONS} disabled wrapperClassName="md:col-span-4" />
          <InputField control={control} name="website" label="Website" placeholder="example.org" rules={organizationRules.website} maxLength={300} disabled={saving} autoFocus wrapperClassName="md:col-span-4" />
          <Dropdown
            control={control} name="contactPerson" label="Contact person"
            placeholder={loadingMembers ? 'Loading members…' : 'Select contact person'}
            options={contactPersonOptions} disabled={saving || loadingMembers} wrapperClassName="md:col-span-4"
          />
          <InputField control={control} name="address" label="Address" rules={organizationRules.address} maxLength={500} disabled={saving} wrapperClassName="md:col-span-8" />
          <Dropdown control={control} name="dioceseId" label="Diocese" placeholder="Select diocese" searchable clearable options={dioceses} disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="city" label="City" maxLength={100} disabled={saving} wrapperClassName="md:col-span-4" />
          <Dropdown control={control} name="state" label="State" placeholder="Select state" searchable options={US_STATE_OPTIONS} disabled={saving} wrapperClassName="md:col-span-4" />
          <InputField control={control} name="zip" label="ZIP code" rules={organizationRules.zip} maxLength={6} validationRule="numbersOnly" disabled={saving} wrapperClassName="md:col-span-4" />
        </div>

        <div className="admin-sticky-footer">
          <CommonButton type="button" variant="outline" size="sm" iconLeft={<X size={14} />} onClick={() => void handleCancel()} disabled={saving}>Cancel</CommonButton>
          <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving || !isDirty}>Save</CommonButton>
        </div>
      </form>
    </section>
  );
  //#endregion
};

export default OrganizationProfilePanel;
