import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { CommonButton } from '@app/components/buttons';
import { Badge } from '@app/components/Badge';
import { BaseModal } from '@app/components/modal/BaseModal';
import { CharacterCount, InputField, TextareaField } from '@app/components/formControls';
import { FormFieldLabel } from '@app/components/formControls/FormFieldLabel';
import { confirmDiscardChanges } from '@/modules/lib/confirm';
import { saveUserRole } from '../../services/userRolesService';
import type { UserRolesApiItem, UserRolesFormValues } from '../../types/userRolesTypes';
import { toSaveUserRolePayload } from '../../utils/userRolesHelpers';
import { userRolesDefaultValues, userRolesRules } from '../../validator/UserRolesValidator';
import { useToast } from '@shared/app/components/ToastProvider';

const ROLE_NAME_MAX_LENGTH = 50;

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
  // Tracks the role name a duplicate-name API error was raised for, so the inline error clears
  // as soon as the user edits the name instead of lingering after it's already been changed.
  const [duplicateRoleName, setDuplicateRoleName] = useState<string | null>(null);
  //#endregion

  const { showToast } = useToast();

  //#region Form
  const { control, handleSubmit, reset, setError, clearErrors, watch, formState: { isValid, isDirty } } = useForm<UserRolesFormValues>({
    defaultValues: userRolesDefaultValues,
    mode: 'onChange',
  });
  const roleNameValue = watch('roleName');
  const isEdit = Boolean(role);
  // Add: enabled once the form is valid. Edit: also requires an actual change — re-saving an
  // untouched role is a no-op the user shouldn't be able to trigger.
  const saveDisabled = saving || !isValid || (isEdit && !isDirty);
  //#endregion

  //#region Functions
  // The unconditional close, used once a save has already gone through (or on mount cleanup) -
  // there is nothing left to discard, so this never prompts.
  const closeWithoutPrompt = () => {
    setFormError(null);
    onClose();
  };

  // Single choke point for every voluntary way to leave the modal - the footer Cancel/Close
  // button, the header X, and Escape all call BaseModal's one `onClose` prop, so gating it here
  // covers all three without needing separate handlers for each. Never called from the
  // successful-save path: a synchronous, un-awaited call here would race the confirm dialog
  // against the save's own toast/close, and `isDirty` read after `reset()` in the same tick can
  // still reflect the pre-reset value in the closure that scheduled this call.
  const handleClose = async () => {
    if (!readOnly && isDirty) {
      const confirmed = await confirmDiscardChanges();
      if (!confirmed) return;
    }
    closeWithoutPrompt();
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
    setDuplicateRoleName(null);
    reset(role ? { roleName: role.roleName, description: role.description ?? '' } : userRolesDefaultValues);
  }, [open, role, reset]);

  useEffect(() => {
    if (duplicateRoleName && roleNameValue !== duplicateRoleName) {
      clearErrors('roleName');
      setDuplicateRoleName(null);
    }
  }, [roleNameValue, duplicateRoleName, clearErrors]);

  // "Navigates away" beyond the modal's own Cancel/Close/Escape (which handleClose already
  // guards) means leaving the page entirely — a tab close, refresh, or typed URL. The browser's
  // own confirmation dialog is the only mechanism for that; its text isn't customizable by design.
  useEffect(() => {
    if (!open || readOnly || !isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [open, readOnly, isDirty]);
  //#endregion

  //#region Handlers
  const onSubmit = async (values: UserRolesFormValues) => {
    // Guards against a double-submit slipping through before the disabled button re-renders
    // (e.g. a fast double-click/double-Enter), on top of the `disabled={saveDisabled}` below.
    if (readOnly || saving) return;
    setSaving(true);
    setFormError(null);
    try {
      const response = await saveUserRole(toSaveUserRolePayload(values, role?.roleId ?? 0, role?.status ?? 'active'));
      if (response.statusCode === 409) {
        const message = response.statusMessage || 'A role with this name already exists.';
        setError('roleName', { type: 'manual', message });
        setDuplicateRoleName(values.roleName);
        return;
      }
      reset(userRolesDefaultValues);
      closeWithoutPrompt();
      showToast(role ? 'User role updated successfully.' : 'User role added successfully.', 'success');
      await onSaved();
    } catch (error) {
      console.error('Error saving user role:', error);
      const message = typeof error === 'string' ? error : 'Failed to save user role.';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Required-field messages already render inline under the field itself (InputField's/
  // TextareaField's own fieldState.error) - toasting them too would show the same "required"
  // complaint twice, once inline and once in a banner. Only surface a toast for anything that
  // wouldn't otherwise be visible.
  const onInvalid = (formErrors: any) => {
    const messages = Object.values(formErrors)
      .map((error: any) => error?.message)
      .filter((message): message is string => Boolean(message) && message !== 'This field is required');
    if (messages.length > 0) {
      showToast(messages, 'error');
    }
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
          <CommonButton id={readOnly ? 'btnCloseUserRoleModal' : 'btnCancelUserRole'} variant="outline" onClick={handleClose} disabled={saving}>{readOnly ? 'Close' : 'Cancel'}</CommonButton>
          {readOnly ? null : <CommonButton id="btnSaveUserRole" variant="primary" onClick={handleSubmit(onSubmit, onInvalid)} loading={saving} disabled={saveDisabled}>Save</CommonButton>}
        </>
      )}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        {readOnly ? <ReadOnlyBanner featureName="User Roles" /> : null}
        {formError ? <p className="text-xs font-semibold text-[var(--error)]">{formError}</p> : null}
        {role ? (
          // Read-only — status is changed via the list page's Activate/Deactivate action (which
          // also enforces the role-in-use guard), not edited inline here. The Save button below
          // never touches status: toSaveUserRolePayload always resends `role.status` unchanged.
          // Laid out like a real field (label above, value below) to match Role Name/Description,
          // instead of the small muted inline "STATUS" tag it used to be.
          <div className="flex flex-col gap-1.5">
            <FormFieldLabel label="Status" />
            <div>
              <Badge id="badgeUserRoleStatus" tone={role.status === 'active' ? 'success' : 'neutral'}>
                {role.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-1">
          <InputField id="txtUserRoleName" control={control} name="roleName" label="Role name" required autoFocus rules={userRolesRules.roleName} maxLength={ROLE_NAME_MAX_LENGTH} disabled={saving || readOnly} />
          <div className="flex justify-end">
            <CharacterCount id="txtUserRoleName-counter" length={roleNameValue?.length ?? 0} maxLength={ROLE_NAME_MAX_LENGTH} />
          </div>
        </div>
        <TextareaField control={control} name="description" label="Description" rows={3} rules={userRolesRules.description} maxLength={250} showCharCount={true} disabled={saving || readOnly} />
      </form>
    </BaseModal>
  );
  //#endregion
};

export default UserRoleFormModal;
