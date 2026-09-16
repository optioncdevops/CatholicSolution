import { useCallback, useEffect, useState } from 'react';
import { useForm} from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { ReadOnlyBanner } from '@shared/app/components/ReadOnlyBanner';
import { useToast } from '@shared/app/components/ToastProvider';
import { useFeatureAccessLevel } from '@shared/auth/hooks/useFeatureAccessLevel';
import { CommonButton } from '@app/components/buttons';
import { DatePicker, Dropdown, InputField, MandatoryIndicator, RadioGroup } from '@app/components/formControls';
import { confirmDiscardChanges } from '@/modules/lib/confirm';
import { getUserById, getUserLookups, saveUser } from '../../services/usersService';
import type { RoleLookupItem, UsersFormValues } from '../../types/usersTypes';
import { getTodayDateOnly, toDateOnly, toSaveUserPayload } from '../../utils/usersHelpers';
import { usersDefaultValues, usersRules } from '../../validator/UsersValidator';
import { getStoredAcutisAuth } from '@shared/auth/services/authService';

const AddUsers = () => {
  //#region Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const userId = (location.state as { id?: number } | undefined)?.id;
  const isEdit = Boolean(userId && userId > 0);
  const accessLevel = useFeatureAccessLevel('/admin/users');
  const isReadOnly = accessLevel === 'readOnly';
  // Editing your own account can't be used to lock yourself out — the backend rejects
  // self-deactivation/self-lock too, but disabling those fields here avoids a confusing save error.
  const isEditingSelf = isEdit && userId === getStoredAcutisAuth()?.resultData?.user?.userId;
  //#endregion

  //#region States
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<RoleLookupItem[]>([]);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset, setError, formState: { isDirty } } = useForm<UsersFormValues>({
    defaultValues: usersDefaultValues,
    mode: 'onChange',
  });
  //#endregion

  //#region Functions
  const navigateToList = useCallback(() => {
    navigate('/admin/users', { replace: true });
  }, [navigate]);

  const handleCancel = async () => {
    if (isDirty) {
      const confirmed = await confirmDiscardChanges();
      if (!confirmed) return;
    }
    navigateToList();
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    if (location.pathname === '/admin/edit-users' && !isEdit) {
      navigateToList();
    }
  }, [isEdit, location.pathname, navigateToList]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData } = await getUserLookups();
        if (cancelled) return;
        const lookups = (resultData ?? {}) as { roles?: RoleLookupItem[] };
        const roleRows = lookups.roles ?? [];
        setRoles(roleRows);

        if (isEdit && userId) {
          const detail = await getUserById(userId);
          if (cancelled) return;
          const row = detail.resultData as {
            firstName?: string;
            lastName?: string;
            eMail?: string;
            roleId?: number;
            isActive?: number;
            isLocked?: number;
            dateOfBirth?: string | null;
            contactNumber?: string | null;
          } | null;
          if (!row) {
            showToast('Failed to load user.', 'error');
            navigateToList();
            return;
          }
          reset({
            firstName: row.firstName ?? '',
            lastName: row.lastName ?? '',
            eMail: row.eMail ?? '',
            password: '',
            roleId: row.roleId ? String(row.roleId) : (roleRows[0] ? String(roleRows[0].roleId) : ''),
            isActive: Number(row.isActive) === 0 ? '0' : '1',
            isLocked: Number(row.isLocked) === 1 ? '1' : '0',
            dateOfBirth: toDateOnly(row.dateOfBirth),
            contactNumber: row.contactNumber ?? '',
          });
          return;
        }

        reset({
          ...usersDefaultValues,
          roleId: roleRows[0] ? String(roleRows[0].roleId) : '',
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading user form:', error);
        showToast(typeof error === 'string' ? error : 'Failed to load user form.', 'error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, reset, showToast, userId, navigateToList]);
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

  const onSubmit = async (values: UsersFormValues) => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      const response = await saveUser(toSaveUserPayload(values, isEdit ? userId : 0));
      if (response.statusCode === 409) {
        const msg = response.statusMessage || 'A user with this email already exists.';
        showToast(msg, 'conflict');
        setError('eMail', { type: 'manual', message: msg });
        return;
      }
      showToast(isEdit ? 'User updated successfully.' : 'User added successfully.');
      navigateToList();
    } catch (error) {
      console.error('Error saving user:', error);
      showToast(typeof error === 'string' ? error : 'Failed to save user.', 'error');
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader title={isEdit ? (isReadOnly ? 'View User' : 'Edit User') : 'Add User'} action={<MandatoryIndicator variant="brand" />} />

      {isReadOnly ? <ReadOnlyBanner featureName="Users" /> : null}

      <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InputField
            control={control}
            name="firstName"
            label="First name"
            placeholder="Enter first name"
            autoFocus
            required
            maxLength={50}
            rules={usersRules.firstName}
            disabled={saving || isReadOnly}
          />
          <InputField
            control={control}
            name="lastName"
            label="Last name"
            placeholder="Enter last name"
            required
            maxLength={50}
            rules={usersRules.lastName}
            disabled={saving || isReadOnly}
          />
          <InputField
            control={control}
            name="eMail"
            label="Email address"
            type="email"
            placeholder="Enter email address"
            required
            rules={usersRules.eMail}
            disabled={saving || isReadOnly}
            autoComplete="off"
          />
          <InputField
            control={control}
            name="password"
            label="Password"
            type="password"
            placeholder={isEdit ? 'Enter password' : 'Enter password'}
            required={!isEdit}
            rules={isEdit ? undefined : usersRules.password}
            disabled={saving || isReadOnly}
            autoComplete="new-password"
          />
          <InputField
            control={control}
            name="contactNumber"
            label="Contact number"
            type="tel"
            placeholder="Enter contact number"
            maxLength={10}
            validationRule="numbersOnly"
            rules={usersRules.contactNumber}
            disabled={saving || isReadOnly}
          />
          <DatePicker
            control={control}
            name="dateOfBirth"
            label="Date of birth"
            placeholder="Select date of birth"
            // Without this the picker hands the form its display format (dd/MM/yyyy), which
            // SaveUser cannot bind to its DateTime field and rejects with a 400.
            outputFormat="yyyy-MM-dd"
            required
            rules={usersRules.dateOfBirth}
            maxDate={getTodayDateOnly()}
            disabled={saving || isReadOnly}
          />
          <Dropdown
            control={control}
            name="roleId"
            label="Role"
            placeholder="Select role"
            required
            searchable={false}
            clearable={false}
            rules={usersRules.roleId}
            options={roles.map((role) => ({ id: String(role.roleId), value: role.roleName }))}
            disabled={saving || isReadOnly}
          />
          <RadioGroup
            control={control}
            name="isActive"
            label="Status"
            direction="horizontal"
            required
            rules={usersRules.isActive}
            options={[
              { id: '1', value: 'Active' },
              { id: '0', value: 'InActive' },
            ]}
            disabled={saving || isReadOnly || isEditingSelf}
          />
          <RadioGroup
            control={control}
            name="isLocked"
            label="Is Locked?"
            direction="horizontal"
            required
            rules={usersRules.isLocked}
            options={[
              { id: '0', value: 'No' },
              { id: '1', value: 'Yes' },
            ]}
            disabled={saving || isReadOnly || isEditingSelf}
          />
        </div>
        {isEditingSelf ? (
          <p className="text-xs text-[var(--text-muted)]">You cannot deactivate or lock your own account.</p>
        ) : null}

        <div className="admin-sticky-footer">
          <CommonButton type="button" variant="outline" size="sm" iconLeft={<X size={14} />} onClick={() => void handleCancel()} disabled={saving}>Cancel</CommonButton>
          {!isReadOnly && (
            <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving || !isDirty}>Save</CommonButton>
          )}
        </div>
      </form>
    </div>
  );
  //#endregion
};

export default AddUsers;
