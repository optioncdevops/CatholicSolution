import { useState } from "react";
import { Save } from "lucide-react";
import { BaseModal } from "@app/components/modal/BaseModal";
import { CommonButton } from "@app/components/buttons";
import { InputField, TextareaField } from "@app/components/formControls";
import { useToast } from "@shared/app/components/ToastProvider";
import { updateProductApiIntegration } from "../../services/productService";
import type { ProductApiIntegrationRow } from "../../types/productTypes";

export interface EditApiIntegrationModalProps {
  integration: ProductApiIntegrationRow | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  readOnly?: boolean;
}

export function EditApiIntegrationModal({ integration, onClose, onSaved, readOnly = false }: EditApiIntegrationModalProps) {
  const { showToast } = useToast();

  const [siteUrl, setSiteUrl] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [renderedId, setRenderedId] = useState<string | null>(null);
  if (integration && renderedId !== integration.id) {
    setRenderedId(integration.id);
    setSiteUrl(integration.siteUrl === "—" ? "" : integration.siteUrl);
    setSiteDescription(integration.siteDescription === "—" ? "" : integration.siteDescription);
  }

  if (!integration) return null;

  const originalSiteUrl = integration ? (integration.siteUrl === "—" ? "" : integration.siteUrl) : "";
  const originalSiteDescription = integration ? (integration.siteDescription === "—" ? "" : integration.siteDescription) : "";

  const hasChanges = siteUrl !== originalSiteUrl || siteDescription !== originalSiteDescription;

  const handleSave = async () => {
    if (readOnly) return;

    setSaving(true);
    try {
      const res = await updateProductApiIntegration({
        productEnvironmentId: integration.productEnvironmentId,
        siteUrl: siteUrl.trim() || undefined,
        siteDescription: siteDescription.trim() || undefined,
      });
      if (res.statusCode && res.statusCode >= 400) {
        throw res.statusMessage || "Failed to update API Integration.";
      }
      showToast("API Integration updated successfully.", "success");
      onClose();
      await onSaved();
    } catch (error) {
      console.error("Error updating API integration:", error);
      showToast(
        typeof error === "string" ? error : "Failed to update API Integration.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={Boolean(integration)}
      onClose={onClose}
      title={`Edit API Integration: ${integration.site}`}
      size="lg"
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
              disabled={saving || !hasChanges}
              onClick={() => void handleSave()}
            >
              Save
            </CommonButton>
          )}
        </>
      }
    >
      <fieldset disabled={readOnly || saving} className="contents">
        <div className="flex flex-col gap-4">
          <InputField
            label="Site URL"
            placeholder="Enter Site URL (e.g. https://api.example.com)"
            value={siteUrl}
            maxLength={300}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSiteUrl(e.target.value)}
          />
          <TextareaField
            label="Site Description"
            placeholder="Enter Site Description"
            value={siteDescription}
            maxLength={300}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSiteDescription(e.target.value)}
            rows={4}
          />
        </div>
      </fieldset>
    </BaseModal>
  );
}
