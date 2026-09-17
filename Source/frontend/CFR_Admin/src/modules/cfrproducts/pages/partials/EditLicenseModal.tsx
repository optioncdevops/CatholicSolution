import { useState } from "react";
import { Save } from "lucide-react";
import { BaseModal } from "@app/components/modal/BaseModal";
import { CommonButton } from "@app/components/buttons";
import { DatePicker, Dropdown, RichTextEditor } from "@app/components/formControls";
import { useToast } from "@shared/app/components/ToastProvider";
import { updateLicense } from "../../services/productService";
import type { ProductLicenseApiItem } from "../../types/productTypes";

const LICENSE_STATUS_OPTIONS = [
  { id: "active", value: "Active" },
  { id: "cancelled", value: "Cancelled" },
  { id: "expired", value: "Expired" },
];

export interface EditLicenseModalProps {
  license: ProductLicenseApiItem | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  readOnly?: boolean;
}

export function EditLicenseModal({ license, onClose, onSaved, readOnly = false }: EditLicenseModalProps) {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [activationDate, setActivationDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [licenseStatus, setLicenseStatus] = useState("active");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  //#endregion

  // Reinitializes form state whenever a different license is opened for editing — adjusted
  // during render (React's own recommended pattern) rather than in an effect, since this modal
  // stays mounted across opens/closes and an effect would paint the previous license's values
  // for one frame before resetting.
  const [renderedLicenseId, setRenderedLicenseId] = useState<number | null>(null);
  if (license && renderedLicenseId !== license.licenseId) {
    setRenderedLicenseId(license.licenseId);
    setActivationDate((license.activationDate || "").slice(0, 10));
    setExpiryDate((license.expiryDate || "").slice(0, 10));
    setLicenseStatus(license.licenseStatus || "active");
    setRemarks(license.remarks || "");
    setTouched(false);
  }

  if (!license) return null;

  //#region Handlers
  const handleSave = async () => {
    if (readOnly) return;
    setTouched(true);
    if (!expiryDate) {
      showToast("Expiry date is required.", "error");
      return;
    }
    if (activationDate && expiryDate < activationDate) {
      showToast("Expiry date cannot be earlier than start date.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await updateLicense({
        licenseId: license.licenseId,
        orgId: license.orgId,
        productId: license.productId,
        licenseType: license.licenseType || "subscription",
        activationDate: `${activationDate}T00:00:00`,
        expiryDate: `${expiryDate}T00:00:00`,
        licenseStatus,
        remarks: remarks.trim() || undefined,
      });
      if (res.statusCode && res.statusCode >= 400) {
        throw res.statusMessage || "Failed to update license.";
      }
      showToast("License updated successfully.", "success");
      onClose();
      await onSaved();
    } catch (error) {
      console.error("Error updating license:", error);
      showToast(
        typeof error === "string" ? error : "Failed to update license.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <BaseModal
      isOpen={Boolean(license)}
      onClose={onClose}
      title="Edit License"
      size="xl"
      autoFocus={false}
      footer={
        <>
          <CommonButton variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </CommonButton>
          {!readOnly && (
            <CommonButton
              variant="primary"
              iconLeft={<Save size={14} />}
              loading={saving}
              onClick={() => void handleSave()}
            >
              Save
            </CommonButton>
          )}
        </>
      }
    >
      <fieldset disabled={readOnly || saving} className="contents">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DatePicker
            label="Start Date"
            required
            placeholder="Select start date"
            value={activationDate}
            outputFormat="yyyy-MM-dd"
            displayFormat="MM/dd/yyyy"
            onChange={(value) => {
              setActivationDate(value);
              if (value && expiryDate && expiryDate < value) {
                setExpiryDate(value);
              }
            }}
          />
          <DatePicker
            label="Expiry Date"
            required
            placeholder="Select expiry date"
            value={expiryDate}
            outputFormat="yyyy-MM-dd"
            displayFormat="MM/dd/yyyy"
            minDate={activationDate || undefined}
            onChange={setExpiryDate}
            error={touched && !expiryDate ? "Expiry date is required." : undefined}
          />
          <Dropdown
            label="License Status"
            searchable={false}
            clearable={false}
            value={licenseStatus}
            onValueChange={(value) => setLicenseStatus(value ?? "active")}
            options={LICENSE_STATUS_OPTIONS}
          />
        </div>

        <div className="mt-3">
          <RichTextEditor
            label="Remarks"
            placeholder="Enter remarks..."
            value={remarks}
            onChange={setRemarks}
          />
        </div>
      </fieldset>
    </BaseModal>
  );
  //#endregion
}
