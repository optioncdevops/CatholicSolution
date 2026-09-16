import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { InputField, TextareaField } from '@app/components/formControls';
import { saveUserRole } from '../../services/userRolesService';
import type { UserRolesApiItem, UserRolesFormValues } from '../../types/userRolesTypes';
import { toSaveUserRolePayload } from '../../utils/userRolesHelpers';
import { userRolesDefaultValues, userRolesRules } from '../../validator/UserRolesValidator';
import { useToast } from '@shared/app/components/ToastProvider';

type UserRoleFormModalProps = {
  open: boolean;
  role: UserRolesApiItem | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  readOnly?: boolean;
};

const UserRoleFormModal = ({ open, role, onClose, onSaved, readOnly = false }: UserRoleFormModalProps) => {
  //#region States
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  //#endregion

  const { showToast } = useToast();

  //#region Form
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<UserRolesFormValues>({
    defaultValues: userRolesDefaultValues,
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
    // Genuine external-library sync, not derivable state: `reset(...)` is react-hook-form's own
    // imperative API for reinitializing its internal (uncontrolled) form state — not a plain
    // setState we can move to render time. `setFormError` travels with it since both represent
    // "the form was just (re)opened for this role."
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormError(null);
    reset(role ? { roleName: role.roleName, description: role.description ?? '' } : userRolesDefaultValues);
  }, [open, role, reset]);
  //#endregion

  //#region Handlers
  const onSubmit = async (values: UserRolesFormValues) => {
    if (readOnly) return;
    setSaving(true);
    setFormError(null);
    try {
      const response = await saveUserRole(toSaveUserRolePayload(values, role?.roleId ?? 0, role?.status ?? 'active'));
      if (response.statusCode === 409) {
        setFormError(response.statusMessage || 'A role with this name already exists.');
        return;
      }
      reset(userRolesDefaultValues);
      showToast(role ? 'User role updated successfully.' : 'User role added successfully.', 'success');
      handleClose();
      await onSaved();
    } catch (error) {
      console.error('Error saving user role:', error);
      setFormError(typeof error === 'string' ? error : 'Failed to save user role.');
    } finally {
      setSaving(false);
    }
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
  //#endregion

  //#region Render
  return (
    <BaseModal
      isOpen={open}
      onClose={handleClose}
      title={role ? (readOnly ? 'View User Role' : 'Edit User Role') : 'Add User Role'}
      size="sm"
      showMandatory={!readOnly}
      footer={(
        <>
          <CommonButton variant="outline" onClick={handleClose} disabled={saving}>{readOnly ? 'Close' : 'Cancel'}</CommonButton>
          {readOnly ? null : <CommonButton variant="primary" onClick={handleSubmit(onSubmit, onInvalid)} loading={saving} disabled={saving || (Boolean(role) && !isDirty)}>Save</CommonButton>}
        </>
      )}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        {readOnly ? <ReadOnlyBanner featureName="User Roles" /> : null}
        {formError ? <p className="text-xs font-semibold text-[var(--error)]">{formError}</p> : null}
        <InputField control={control} name="roleName" label="Role name" required rules={userRolesRules.roleName} maxLength={50} disabled={saving || readOnly} />
        <TextareaField control={control} name="description" label="Description" rows={3} rules={userRolesRules.description} maxLength={250} showCharCount={true} disabled={saving || readOnly} />
      </form>
    </BaseModal>
  );
  //#endregion
};

export default UserRoleFormModal;
