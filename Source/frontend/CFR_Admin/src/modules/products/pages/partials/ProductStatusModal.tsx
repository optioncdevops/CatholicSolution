import { BaseModal } from "@app/components/modal/BaseModal";
import { CommonButton } from "@app/components/buttons";
import { StatusBadge } from "@app/components/Badge";
import { confirmAction } from "@/modules/lib/confirm";
import {
  STATUS_IMPACT,
  CHANGE_STATUS_DESCRIPTION,
} from "../../validator/productValidation";
import { PRODUCT_MODAL_STATUS_OPTIONS } from "../../utils/productFilters";
import type { AdminApplication, ProductStatus } from "@/modules/types";

export interface ProductStatusModalProps {
  app: AdminApplication | null;
  onClose: () => void;
  onConfirm: (status: ProductStatus) => void;
  pendingStatus: ProductStatus | null;
  onSelectStatus: (status: ProductStatus | null) => void;
}

export const ProductStatusModal = ({
  app,
  onClose,
  onConfirm,
  pendingStatus,
  onSelectStatus,
}: ProductStatusModalProps) => {
  const commitStatusChange = async () => {
    if (!pendingStatus) return;
    const confirmed = await confirmAction({
      title: `Set status to "${pendingStatus.replace("-", " ")}"?`,
      description: STATUS_IMPACT[pendingStatus],
      confirmLabel: "Confirm status change",
      tone: pendingStatus === "inactive" ? "danger" : "primary",
    });
    if (confirmed) onConfirm(pendingStatus);
  };

  return (
    <BaseModal
      isOpen={Boolean(app)}
      onClose={onClose}
      title={app ? `Change Status — ${app.name}` : ""}
      size="sm"
      closeOnOverlayClick={false}
      autoFocus={false}
      footer={
        <>
          <CommonButton variant="outline" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton
            variant="primary"
            disabled={!pendingStatus || pendingStatus === app?.status}
            onClick={() => void commitStatusChange()}
          >
            Continue
          </CommonButton>
        </>
      }
    >
      {app ? (
        <div className="flex flex-col gap-3.5">
          <p className="text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
            {CHANGE_STATUS_DESCRIPTION}
          </p>
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">New Status</legend>
            {PRODUCT_MODAL_STATUS_OPTIONS.map((status) => {
              const isCurrent = status === app.status;
              const isSelected = pendingStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onSelectStatus(status)}
                  disabled={isCurrent}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left transition-all ${
                    isCurrent
                      ? "border-[var(--line-soft)] bg-[var(--surface-muted)] opacity-70 cursor-not-allowed"
                      : isSelected
                        ? "border-[var(--primary)] bg-[var(--primary-muted)] shadow-xs ring-2 ring-[var(--primary)]/20 cursor-pointer"
                        : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)]/60 hover:bg-[var(--hover)] cursor-pointer"
                  }`}
                >
                  <StatusBadge status={status} kind="application" />
                  {isCurrent ? (
                    <span className="rounded-full border border-[var(--line-soft)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Current
                    </span>
                  ) : isSelected ? (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]">
                      <span className="size-1.5 rounded-full bg-[var(--surface)]" />
                    </span>
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border-2 border-[var(--line-strong)]" />
                  )}
                </button>
              );
            })}
          </fieldset>
        </div>
      ) : null}
    </BaseModal>
  );
};
