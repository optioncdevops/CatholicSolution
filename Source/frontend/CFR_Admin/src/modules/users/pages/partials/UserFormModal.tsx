import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { Dropdown, InputField, RadioGroup } from '@app/components/formControls';
import { getUserLookups, saveUser } from '../../services/usersService';
import type { OrganizationLookupItem, RoleLookupItem, UsersFormValues } from '../../types/usersTypes';
import { toSaveUserPayload } from '../../utils/usersHelpers';
import { usersDefaultValues, usersRules } from '../../validator/UsersValidator';

type UserFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

const UserFormModal = ({ open, onClose, onSaved }: UserFormModalProps) => {
  //#region States
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationLookupItem[]>([]);
  const [roles, setRoles] = useState<RoleLookupItem[]>([]);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset } = useForm<UsersFormValues>({
    defaultValues: usersDefaultValues,
    mode: 'onChange',
  });
  //#endregion

  //#region Functions
  const handleClose = () => {
    setFormError(null);
    onClose();
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const { resultData } = await getUserLookups();
        if (cancelled) return;
        const lookups = (resultData ?? {}) as { organizations?: OrganizationLookupItem[]; roles?: RoleLookupItem[] };
        const orgRows = lookups.organizations ?? [];
        const roleRows = lookups.roles ?? [];
        setOrganizations(orgRows);
        setRoles(roleRows);
        reset({
          ...usersDefaultValues,
          organizationId: orgRows[0] ? String(orgRows[0].organizationId) : '',
          roleId: roleRows[0] ? String(roleRows[0].roleId) : '',
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading user lookups:', error);
        setFormError(typeof error === 'string' ? error : 'Failed to load lookups.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, reset]);
  //#endregion

  //#region Handlers
  const onSubmit = async (values: UsersFormValues) => {
    setSaving(true);
    setFormError(null);
    try {
      const response = await saveUser(toSaveUserPayload(values));
      if (response.statusCode === 409) {
        setFormError(response.statusMessage || 'A user with this email already exists.');
        return;
      }
      reset(usersDefaultValues);
      handleClose();
      await onSaved();
    } catch (error) {
      console.error('Error saving user:', error);
      setFormError(typeof error === 'string' ? error : 'Failed to save user.');
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
      title="Add User"
      size="sm"
      showMandatory
      footer={(
        <>
          <CommonButton variant="outline" onClick={handleClose} disabled={saving}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit(onSubmit)} loading={saving} disabled={saving}>Save</CommonButton>
        </>
      )}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {formError ? <p className="text-xs font-semibold text-[var(--error)]">{formError}</p> : null}
        <InputField control={control} name="firstName" label="First name" required rules={usersRules.firstName} disabled={saving} />
        <InputField control={control} name="lastName" label="Last name" required rules={usersRules.lastName} disabled={saving} />
        <InputField control={control} name="eMail" label="Email address" type="email" required rules={usersRules.eMail} disabled={saving} />
        <InputField control={control} name="password" label="Password" type="password" required rules={usersRules.password} disabled={saving} />
        <Dropdown
          control={control}
          name="organizationId"
          label="Organization"
          required
          searchable={false}
          clearable={false}
          rules={usersRules.organizationId}
          options={organizations.map((org) => ({ id: String(org.organizationId), value: org.name }))}
          disabled={saving}
        />
        <Dropdown
          control={control}
          name="roleId"
          label="Role"
          required
          searchable={false}
          clearable={false}
          rules={usersRules.roleId}
          options={roles.map((role) => ({ id: String(role.roleId), value: role.roleName }))}
          disabled={saving}
        />
        <RadioGroup
          control={control}
          name="status"
          label="Initial Status"
          direction="horizontal"
          options={[
            { id: 'invited', value: 'Invited' },
            { id: 'active', value: 'Active' },
          ]}
        />
      </form>
    </BaseModal>
  );
  //#endregion
};

export default UserFormModal;
