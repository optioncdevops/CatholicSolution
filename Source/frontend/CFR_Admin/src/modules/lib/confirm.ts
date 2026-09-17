import Swal from 'sweetalert2';

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
}

/**
 * Themed SweetAlert2 confirmation, matching the admin console's design tokens instead of
 * SweetAlert2's default styling. Resolves `true` on confirm, `false` on cancel/dismiss.
 */
export async function confirmAction({ title, description, confirmLabel, tone = 'primary' }: ConfirmOptions): Promise<boolean> {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const primary = styles.getPropertyValue('--primary').trim() || '#12264c';
  const error = styles.getPropertyValue('--error').trim() || '#dc2626';
  const textMuted = styles.getPropertyValue('--text-muted').trim() || '#64748b';
  const surface = styles.getPropertyValue('--surface').trim() || '#ffffff';

  const result = await Swal.fire({
    title,
    text: description,
    icon: tone === 'danger' ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: confirmLabel,
    cancelButtonText: 'Cancel',
    confirmButtonColor: tone === 'danger' ? error : primary,
    cancelButtonColor: textMuted,
    background: surface,
    reverseButtons: true,
    focusCancel: tone === 'danger',
    customClass: {
      popup: 'admin-swal-popup',
      title: 'admin-swal-title',
      htmlContainer: 'admin-swal-text',
      confirmButton: 'admin-swal-confirm',
      cancelButton: 'admin-swal-cancel',
    },
  });

  return result.isConfirmed;
}

/**
 * Standard "discard unsaved changes" confirmation for Cancel/Close on a dirty form or modal.
 */
export function confirmDiscardChanges(): Promise<boolean> {
  return confirmAction({
    title: 'Discard changes?',
    description: 'You have unsaved changes that will be lost. Are you sure you want to cancel?',
    confirmLabel: 'Discard changes',
    tone: 'danger',
  });
}
