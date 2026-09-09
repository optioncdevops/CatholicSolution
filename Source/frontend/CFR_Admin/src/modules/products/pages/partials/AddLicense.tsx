import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { useToast } from "@shared/app/components/ToastProvider";
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
  customerHasActiveLicense,
  formatCustomerCodeNumeric,
  parseProductIdFromState,
} from "../../utils/productHelpers";
import { validateLicenseForm } from "../../validator/productValidation";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function inDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

const AddLicense = () => {
  //#region Hooks
  const location = useLocation();
  const stateProductId = parseProductIdFromState(location.state);
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [orgId, setOrgId] = useState("");
  const [activationDate, setActivationDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState(inDays(365));
  const [customMessage, setCustomMessage] = useState("");
  const [touched, setTouched] = useState(false);
  //#endregion

  //#region Functions
  const goToLicenseDetails = () => {
    const productId = product?.productId || stateProductId;
    if (productId) {
      navigate(PRODUCTS_PATHS.details, {
        state: { productId, tab: "invoice-details" },
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

      const [productRes, orgRes, licenseRes] = await Promise.all([
        getProductById(resolvedId),
        getOrganizations(),
        getLicenseDetails(resolvedId),
      ]);
      const loadedProduct =
        (productRes.resultData as ProductApiItem | null) ?? null;
      const loadedOrgs =
        orgRes.statusCode === 204
          ? []
          : normalizeOrganizationsList(orgRes.resultData);
      const existingLicenses = Array.isArray(licenseRes.resultData)
        ? (licenseRes.resultData as ProductLicenseApiItem[])
        : [];
      const eligibleOrgs = loadedOrgs.filter(
        (org) => !customerHasActiveLicense(existingLicenses, org.orgId)
      );
      setProduct(loadedProduct);
      setOrganizations(eligibleOrgs);
      if (loadedProduct) {
        setTitle(`${loadedProduct.productName} — License`);
      }
      if (eligibleOrgs[0]) {
        setOrgId(String(eligibleOrgs[0].orgId));
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
          Open Create License from a product so the product id is passed in
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
        title: "Discard this license?",
        description:
          "You have unsaved license details. Leaving now will discard them.",
        confirmLabel: "Discard license",
        tone: "danger",
      });
      if (!confirmed) return;
    }
    goToLicenseDetails();
  };

  const productId = product.productId;

  const handleSubmit = async () => {
    setTouched(true);
    if (organizations.length === 0) {
      showToast("All organizations already have an active license for this product.", "error");
      return;
    }
    const messages = validateLicenseForm({
      title,
      orgId,
      activationDate,
      expiryDate,
      customMessage,
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
      if (customerHasActiveLicense(existingLicenses, Number(orgId))) {
        showToast("A license for this organization already exists.", "error");
        return;
      }

      const remarks = [title.trim(), customMessage.trim()]
        .filter(Boolean)
        .join("\n")
        .slice(0, 500);
      const res = await createLicense({
        orgId: Number(orgId),
        productId,
        licenseType: "subscription",
        activationDate: `${activationDate}T00:00:00`,
        expiryDate: `${expiryDate}T00:00:00`,
        licenseStatus: DEFAULT_LICENSE_STATUS,
        assignStatus: DEFAULT_LICENSE_STATUS,
        remarks: remarks || undefined,
      });
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
        title="Create License"
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
            <div className="flex flex-col divide-y divide-[var(--line-soft)]">
              <div>
                <div className="admin-panel-card__header">
                  <h2 className="panel-title">License Details</h2>
                </div>
                <div className="grid gap-2.5 p-3 sm:grid-cols-2">
                  <InputField
                    label="Title"
                    required
                    autoFocus
                    placeholder="Enter title"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setTouched(true);
                    }}
                    error={
                      touched && !title.trim()
                        ? "Title is required."
                        : undefined
                    }
                  />
                  <Dropdown
                    label="Organization"
                    required
                    placeholder={organizations.length === 0 ? "No available organizations" : "Select organization"}
                    value={orgId}
                    disabled={organizations.length === 0}
                    onValueChange={(value) => {
                      setOrgId(value ?? "");
                      setTouched(true);
                    }}
                    options={organizations.map((org) => ({
                      id: String(org.orgId),
                      value: `${org.orgName} (${formatCustomerCodeNumeric(org.orgId)})`,
                    }))}
                    searchable
                    clearable={false}
                    error={
                      touched && !orgId ? "Organization is required." : undefined
                    }
                  />
                </div>

                <div className="grid gap-2.5 p-3 pt-0 sm:grid-cols-2">
                  <DatePicker
                    label="Start Date"
                    required
                    placeholder="Select start date"
                    value={activationDate}
                    outputFormat="yyyy-MM-dd"
                    displayFormat="MM/dd/yyyy"
                    onChange={(value) => {
                      setActivationDate(value);
                      setTouched(true);
                    }}
                  />
                  <DatePicker
                    label="Expiry Date"
                    required
                    placeholder="Select expiry date"
                    value={expiryDate}
                    outputFormat="yyyy-MM-dd"
                    displayFormat="MM/dd/yyyy"
                    onChange={(value) => {
                      setExpiryDate(value);
                      setTouched(true);
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="admin-panel-card__header">
                  <h2 className="panel-title">Custom Message</h2>
                </div>
                <div className="p-3">
                  <RichTextEditor
                    label="Custom Message"
                    hideLabel
                    placeholder="Start typing here..."
                    value={customMessage}
                    onChange={(value) => {
                      setCustomMessage(value);
                      setTouched(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="admin-sticky-footer">
            <CommonButton
              variant="outline"
              iconLeft={<X size={14} />}
              onClick={() => void handleCancel()}
            >
              Cancel
            </CommonButton>
            <CommonButton
              variant="primary"
              iconLeft={<Save size={14} />}
              type="submit"
              loading={saving}
              disabled={saving || organizations.length === 0}
            >
              Save
            </CommonButton>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddLicense;
