import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { ReadOnlyBanner } from "@shared/app/components/ReadOnlyBanner";
import { useToast } from "@shared/app/components/ToastProvider";
import { useFeatureAccessLevel } from "@/modules/authentication/hooks/useFeatureAccessLevel";
import { CommonButton } from "@app/components/buttons";
import {
  DatePicker,
  Dropdown,
  InputField,
  MandatoryIndicator,
  RichTextEditor,
} from "@app/components/formControls";
import { confirmAction } from "@/modules/lib/confirm";
import { getOrganizations } from "@/modules/organizations/services/organizationsService";
import type { OrganizationApiItem } from "@/modules/organizations/types/organizationTypes";
import { normalizeOrganizationsList } from "@/modules/organizations/utils/organizationHelpers";
import {
  createLicense,
  getLicenseDetails,
  getProductById,
} from "../../services/productService";
import type {
  ProductApiItem,
  ProductLicenseApiItem,
} from "../../types/productTypes";
import {
  DEFAULT_LICENSE_STATUS,
  PRODUCTS_PATHS,
  formatCustomerCodeAsInteger,
  parseProductIdFromState,
} from "../../utils/productHelpers";
import { validateLicenseForm } from "../../validator/productValidation";

function today(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function inDays(days: number, fromDateStr?: string): string {
  if (fromDateStr) {
    const [y, m, d] = fromDateStr.split("-").map(Number);
    if (y && m && d) {
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() + days);
      const ny = dt.getFullYear();
      const nm = String(dt.getMonth() + 1).padStart(2, "0");
      const nd = String(dt.getDate()).padStart(2, "0");
      return `${ny}-${nm}-${nd}`;
    }
  }
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const AddLicense = () => {
  //#region Hooks
  const location = useLocation();
  const stateProductId = parseProductIdFromState(location.state);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel(PRODUCTS_PATHS.list);
  const isReadOnly = accessLevel === "readOnly";
  //#endregion

  //#region States
  const todayDate = today();
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [activationDate, setActivationDate] = useState(todayDate);
  const [expiryDate, setExpiryDate] = useState(inDays(365, todayDate));
  const [remarks, setRemarks] = useState("");
  const [touched, setTouched] = useState(false);
  //#endregion

  //#region Functions
  const goToLicenseDetails = () => {
    const productId = product?.productId || stateProductId;
    if (productId) {
      navigate(PRODUCTS_PATHS.details, {
        state: { productId, tab: "license-details" },
      });
      return;
    }
    navigate(PRODUCTS_PATHS.list);
  };

  const loadPage = useCallback(async () => {
    setLoading(true);
    try {
      const resolvedId = stateProductId;

      if (!resolvedId) {
        setLoading(false);
        setProduct(null);
        setOrganizations([]);
        return;
      }

      const [productRes, orgRes] = await Promise.all([
        getProductById(resolvedId),
        getOrganizations(),
      ]);
      const loadedProduct =
        (productRes.resultData as ProductApiItem | null) ?? null;
      const loadedOrgs =
        orgRes.statusCode === 204
          ? []
          : normalizeOrganizationsList(orgRes.resultData);
      setProduct(loadedProduct);
      setOrganizations(loadedOrgs);
      if (loadedOrgs[0]) {
        setOrgId(String(loadedOrgs[0].orgId));
      } else {
        setOrgId("");
      }
    } catch (error) {
      console.error("Error loading create license page:", error);
      showToast(
        typeof error === "string"
          ? error
          : "Failed to load create license page.",
        "error",
      );
      setProduct(null);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [stateProductId, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPage();
  }, [loadPage]);
  //#endregion

  if (loading) {
    return (
      <div className="admin-reveal flex flex-col gap-4" aria-busy="true">
        <div className="admin-skeleton h-12 w-full rounded-[var(--radius-panel)]" />
        <div className="admin-skeleton h-64 w-full rounded-[var(--radius-panel)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-reveal flex flex-col items-center justify-center gap-3 py-16 text-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Product Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Open Create Invoice from a product so the product id is passed in
          location state.
        </p>
        <CommonButton
          variant="outline"
          size="sm"
          onClick={() => navigate(PRODUCTS_PATHS.list)}
        >
          Back to Products
        </CommonButton>
      </div>
    );
  }

  const handleCancel = async () => {
    if (touched) {
      const confirmed = await confirmAction({
        title: "Discard this invoice?",
        description:
          "You have unsaved invoice details. Leaving now will discard them.",
        confirmLabel: "Discard invoice",
        tone: "danger",
      });
      if (!confirmed) return;
    }
    goToLicenseDetails();
  };

  const productId = product.productId;

  const handleSubmit = async () => {
    if (isReadOnly) return;
    setTouched(true);
    if (organizations.length === 0) {
      showToast("All organizations already have an active license for this product.", "error");
      return;
    }
    const messages = validateLicenseForm({
      orgId,
      activationDate,
      expiryDate,
      remarks,
    });
    if (messages.length > 0) {
      showToast(messages, "error");
      return;
    }

    setSaving(true);
    try {
      const existingRes = await getLicenseDetails(productId);
      const existingLicenses = Array.isArray(existingRes.resultData)
        ? (existingRes.resultData as ProductLicenseApiItem[])
        : [];

      const targetOrgId = Number(orgId);
      const hasDurationOverlap = existingLicenses.some((lic) => {
        if (lic.orgId !== targetOrgId) return false;
        const licStatus = (lic.licenseStatus ?? "").trim().toLowerCase();
        if (licStatus === "cancelled") return false;

        const licStart =
          (lic.activationDate ? lic.activationDate.split("T")[0] : "") ||
          (lic.createdDate ? lic.createdDate.split("T")[0] : "");
        const licEnd = lic.expiryDate ? lic.expiryDate.split("T")[0] : "9999-12-31";

        if (!licStart) return false;
        return activationDate <= licEnd && expiryDate >= licStart;
      });

      if (hasDurationOverlap) {
        showToast("A license has already been created for this duration.", "warning");
        return;
      }

      const res = await createLicense({
        orgId: Number(orgId),
        productId,
        licenseType: "subscription",
        activationDate: `${activationDate}T00:00:00`,
        expiryDate: `${expiryDate}T00:00:00`,
        licenseStatus: DEFAULT_LICENSE_STATUS,
        assignStatus: DEFAULT_LICENSE_STATUS,
        remarks: remarks.trim() || undefined,
      });
      if (res.statusCode === 409) {
        showToast(res.statusMessage || "A license has already been created for this duration.", "warning");
        return;
      }
      if (res.statusCode && res.statusCode >= 400) {
        throw res.statusMessage || "Failed to create license.";
      }
      showToast("License added successfully.", "success");
      goToLicenseDetails();
    } catch (error) {
      console.error("Error creating license:", error);
      showToast(
        typeof error === "string" ? error : "Failed to create license.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Create Invoice"
        action={
          <div className="flex items-center gap-2">
            <CommonButton
              variant="headerSecondary"
              iconLeft={<ArrowLeft size={14} />}
              onClick={() => void handleCancel()}
            >
              Back
            </CommonButton>
            <MandatoryIndicator variant="brand" />
          </div>
        }
      />

      {isReadOnly ? <ReadOnlyBanner featureName="Products" /> : null}

      {organizations.length === 0 ? (
        <section className="admin-panel-card p-4">
          <p className="text-sm text-[var(--text-muted)]">
            This product has no organizations to license yet — assign it to an
            organization first.
          </p>
          <div className="mt-3">
            <CommonButton
              variant="outline"
              iconLeft={<X size={14} />}
              onClick={() => void handleCancel()}
            >
              Cancel
            </CommonButton>
          </div>
        </section>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
          noValidate
          className="flex flex-col gap-3"
        >
          <section className="admin-panel-card overflow-hidden">
            <fieldset disabled={isReadOnly} className="contents">
            <div className="flex flex-col divide-y divide-[var(--line-soft)]">
              <div>
                <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InputField
                    label="Product Title"
                    value={product.productName}
                    readOnly
                    disabled
                  />
                  <Dropdown
                    label="Organization"
                    required
                    autoFocus
                    placeholder={organizations.length === 0 ? "No available organizations" : "Select organization"}
                    value={orgId}
                    disabled={organizations.length === 0}
                    onValueChange={(value) => {
                      setOrgId(value ?? "");
                      setTouched(true);
                    }}
                    options={organizations.map((org) => ({
                      id: String(org.orgId),
                      value: `${formatCustomerCodeAsInteger(org.orgId)} - ${org.orgName}`,
                    }))}
                    searchable
                    clearable={false}
                    error={
                      touched && !orgId ? "Organization is required." : undefined
                    }
                  />
                  <DatePicker
                    label="Start Date"
                    required
                    placeholder="Select start date"
                    value={activationDate}
                    outputFormat="yyyy-MM-dd"
                    displayFormat="MM/dd/yyyy"
                    minDate={todayDate}
                    onChange={(value) => {
                      setActivationDate(value);
                      setTouched(true);
                      if (value && expiryDate && expiryDate < value) {
                        setExpiryDate(inDays(365, value));
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
                    minDate={activationDate || todayDate}
                    onChange={(value) => {
                      setExpiryDate(value);
                      setTouched(true);
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="admin-panel-card__header">
                  <h2 className="panel-title">Remarks</h2>
                </div>
                <div className="p-3">
                  <RichTextEditor
                    label="Remarks"
                    hideLabel
                    placeholder="Enter remarks..."
                    value={remarks}
                    onChange={(value) => {
                      setRemarks(value);
                      setTouched(true);
                    }}
                  />
                </div>
              </div>
            </div>
            </fieldset>
          </section>

          <div className="admin-sticky-footer">
            <CommonButton
              variant="outline"
              iconLeft={<X size={14} />}
              onClick={() => void handleCancel()}
            >
              Cancel
            </CommonButton>
            {!isReadOnly && (
              <CommonButton
                variant="primary"
                iconLeft={<Save size={14} />}
                type="submit"
                loading={saving}
                disabled={saving || organizations.length === 0}
              >
                Save
              </CommonButton>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default AddLicense;
