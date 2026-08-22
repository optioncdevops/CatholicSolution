import toast from "react-hot-toast";

/**
 * Simplified port of the reference project's `CustomToastMessage` module.
 *
 * The reference project builds `showToast` on `react-toastify` with a large custom
 * card renderer (icon, title, action button, per-variant theme colors). CFR_Admin
 * already uses `react-hot-toast` project-wide for toasts, and the ported
 * dataTable/formControls code only ever calls `showToast.success/error/warning(message)`
 * — so rather than pull in a second toast library, this adapts the same `showToast` API
 * onto the toast system CFR_Admin already has.
 */
export type ToastVariant = "error" | "success" | "warning" | "info";

function toastMessage(variant: ToastVariant, message?: string | null): string {
  if (message?.trim()) {return message;}
  switch (variant) {
    case "error":
      return "Please fill in the required fields";
    case "success":
      return "Saved successfully";
    case "warning":
      return "Be cautious!";
    case "info":
    default:
      return "This is an info message";
  }
}

export const showToast = {
  success: (message?: string | null) => toast.success(toastMessage("success", message)),
  error: (message?: string | null) => toast.error(toastMessage("error", message)),
  warning: (message?: string | null) => toast(toastMessage("warning", message), { icon: "⚠️" }),
  info: (message?: string | null) => toast(toastMessage("info", message), { icon: "ℹ️" }),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),
};
