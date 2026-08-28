import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CommonButton } from '@app/components/buttons';
import { BaseModal } from '@app/components/modal/BaseModal';
import { InputField, TextareaField } from '@app/components/formControls';
import { saveUserRole } from '../../services/userRolesService';
import type { UserRolesApiItem, UserRolesFormValues } from '../../types/userRolesTypes';
import { toSaveUserRolePayload } from '../../utils/userRolesHelpers';
import { userRolesDefaultValues, userRolesRules } from '../../validator/UserRolesValidator';

type UserRoleFormModalProps = {
  open: boolean;
  role: UserRolesApiItem | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

const UserRoleFormModal = ({ open, role, onClose, onSaved }: UserRoleFormModalProps) => {
  //#region States
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset } = useForm<UserRolesFormValues>({
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
    setFormError(null);
    reset(role ? { roleName: role.roleName, description: role.description ?? '' } : userRolesDefaultValues);
  }, [open, role, reset]);
  //#endregion

  //#region Handlers
  const onSubmit = async (values: UserRolesFormValues) => {
    setSaving(true);
    setFormError(null);
    try {
      const response = await saveUserRole(toSaveUserRolePayload(values, role?.roleId ?? 0, role?.status ?? 'active'));
      if (response.statusCode === 409) {
        setFormError(response.statusMessage || 'A role with this name already exists.');
        return;
      }
      reset(userRolesDefaultValues);
      handleClose();
      await onSaved();
    } catch (error) {
      console.error('Error saving user role:', error);
      setFormError(typeof error === 'string' ? error : 'Failed to save user role.');
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
      title={role ? 'Edit User Role' : 'Add User Role'}
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
        <InputField control={control} name="roleName" label="Role name" required rules={userRolesRules.roleName} disabled={saving} />
        <TextareaField control={control} name="description" label="Description" rows={3} showCharCount={false} disabled={saving} />
      </form>
    </BaseModal>
  );
  //#endregion
};

export default UserRoleFormModal;
