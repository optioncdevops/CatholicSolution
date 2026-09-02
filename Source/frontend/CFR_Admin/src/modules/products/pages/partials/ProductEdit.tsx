import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Save, X } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { useToast } from "@shared/app/components/ToastProvider";
import { CommonButton } from "@app/components/buttons";
import { InputField, MandatoryIndicator, ProfileImageUpload, RadioGroup, TextareaField } from "@app/components/formControls";
import { StatusBadge } from "@app/components/Badge";
import { cn } from "@app/utilities/cn";
import { confirmAction } from "@/modules/lib/confirm";
import { validateProductForm, type ProductFormErrors } from "../../validator/productValidation";
import {
  getProductById,
  getProducts,
  updateProduct,
  uploadProductLogo,
} from "../../services/productService";
import type {
  ProductApiItem,
  ProductInputPayload,
} from "../../types/productTypes";
import {
  DEFAULT_PRODUCT_ICON,
  PRODUCTS_PATHS,
  normalizeProductList,
  normalizeProductApiItem,
  parseProductIdFromState,
  resolveProductLogoUrl,
  toStoredProductLogoPath,
  toAdminApplication,
  toProductSlug,
} from "../../utils/productHelpers";
import type { AdminApplication, ProductLicenseType, ProductNavigationTarget } from "@/modules/types";

const LICENSE_TYPE_OPTIONS: Array<{ id: ProductLicenseType; value: string }> = [
  { id: "free", value: "Free" },
  { id: "licensed", value: "Licensed" },
];

const NAVIGATION_OPTIONS: Array<{ id: ProductNavigationTarget; value: string }> = [
  { id: "same-tab", value: "Same Tab" },
  { id: "new-tab", value: "New Tab" },
];

function isImageIcon(icon: string): boolean {
  if (!icon) return false;
  return icon.startsWith("data:") || icon.startsWith("blob:") || icon.startsWith("/") || /^https?:\/\//i.test(icon);
}

function ProductIcon({ icon, gradient }: { icon: string; gradient: string }) {
  if (isImageIcon(icon)) {
    const resolved =
      icon.startsWith("data:") || icon.startsWith("blob:") || /^https?:\/\//i.test(icon)
        ? icon
        : resolveProductLogoUrl(icon) || icon;
    return <img src={resolved} alt="" className="size-9 shrink-0 rounded-lg object-cover" aria-hidden="true" />;
  }
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white" style={{ background: gradient }} aria-hidden="true">
      {icon}
    </span>
  );
}

function ProductCard({
  app,
  linkTo,
  warningCount = 0,
  footer,
  className,
}: {
  app: Pick<AdminApplication, "name" | "category" | "icon" | "gradient" | "description" | "status">;
  linkTo?: string;
  warningCount?: number;
  footer?: ReactNode;
  className?: string;
}) {
  const identity = (
    <>
      <ProductIcon icon={app.icon} gradient={app.gradient} />
      <div className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className={cn("truncate text-sm font-extrabold text-[var(--text-primary)]", linkTo && "group-hover:underline")}>{app.name}</span>
          {warningCount > 0 ? (
            <span title={`${warningCount} data quality warning${warningCount === 1 ? "" : "s"}`} aria-label={`${warningCount} data quality warning${warningCount === 1 ? "" : "s"}`}>
              <AlertTriangle size={13} className="shrink-0 text-[var(--warning)]" />
            </span>
          ) : null}
        </span>
        <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">{app.category}</span>
      </div>
    </>
  );

  return (
    <article className={cn("admin-product-card relative", !linkTo && "admin-product-card--static", className)}>
      <div className="absolute right-[0.85rem] top-3">
        <StatusBadge status={app.status} kind="application" />
      </div>
      <div className="flex items-center gap-2.5 pr-16">
        {linkTo ? (
          <Link to={linkTo} className="group flex min-w-0 items-center gap-2.5">{identity}</Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">{identity}</div>
        )}
      </div>
      <p className="admin-product-card__description">{app.description || "No description yet."}</p>
      {footer ? (
        <div className="mt-auto">
          <div className="admin-product-card__divider" />
          {footer}
        </div>
      ) : null}
    </article>
  );
}

function TagList({ label, values, draft, onDraftChange, onAdd, onRemove }: {
  label: string;
  values: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {values.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">None added yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li key={value} className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              {value}
              <button type="button" onClick={() => onRemove(value)} aria-label={`Remove ${value}`} className="text-[var(--text-faint)] hover:text-[var(--error)]">✕</button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); onAdd(); } }}
          placeholder={`Add ${label.toLowerCase()} and press Enter`}
          className="flex-1 rounded-[var(--admin-control-radius)] border border-[var(--line)] px-3 py-2 text-[length:var(--admin-text-base)] text-[var(--text-primary)]"
        />
        <CommonButton variant="outline" size="sm" onClick={onAdd}>Add</CommonButton>
      </div>
    </div>
  );
}

function ProductForm({
  form,
  errors,
  touched,
  onUpdate,
  onLogoFileChange,
}: {
  form: AdminApplication;
  errors: ProductFormErrors;
  touched: boolean;
  onUpdate: <K extends keyof AdminApplication>(key: K, value: AdminApplication[K]) => void;
  onLogoFileChange?: (file: File | null) => void;
}) {
  const [featureDraft, setFeatureDraft] = useState("");

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    onUpdate("features", [...(form.features ?? []), value]);
    setFeatureDraft("");
  };
  const removeFeature = (value: string) => onUpdate("features", (form.features ?? []).filter((item) => item !== value));

  const handleLogoChange = (file: File | null) => {
    if (onLogoFileChange) {
      onLogoFileChange(file);
    } else if (file) {
      const localUrl = URL.createObjectURL(file);
      onUpdate("icon", localUrl);
    }
  };

  const previewUrl = resolveProductLogoUrl(form.icon) || (isImageIcon(form.icon) ? form.icon : undefined);

  return (
    <section className="admin-panel-card">
      <div className="flex flex-col divide-y divide-[var(--line-soft)]">
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <InputField label="Product Name" required placeholder="Enter product name" autoFocus value={form.name} onChange={(event) => onUpdate("name", event.target.value)} error={touched ? errors.name : undefined} />
          <InputField label="Short Name" placeholder="Enter short name" value={form.shortName} onChange={(event) => onUpdate("shortName", event.target.value)} />
          <InputField label="Product Subtitle" required placeholder="Enter product subtitle" value={form.category} onChange={(event) => onUpdate("category", event.target.value)} error={touched ? errors.category : undefined} />
          <InputField
            label="Production URL"
            value={form.productionUrl}
            onChange={(event) => onUpdate("productionUrl", event.target.value)}
            placeholder="https://app.optioncapp.com"
            error={touched ? errors.productionUrl : undefined}
          />
          <RadioGroup
            label="License Type"
            options={LICENSE_TYPE_OPTIONS}
            value={form.licenseType}
            onValueChange={(value) => onUpdate("licenseType", value as ProductLicenseType)}
          />
          <RadioGroup
            label="Navigation Target"
            options={NAVIGATION_OPTIONS}
            value={form.navigationTarget}
            onValueChange={(value) => onUpdate("navigationTarget", value as ProductNavigationTarget)}
          />
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Features</p>
          <TagList label="Features" values={form.features ?? []} draft={featureDraft} onDraftChange={setFeatureDraft} onAdd={addFeature} onRemove={removeFeature} />
        </div>

        <div className="p-4">
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">Product Preview</p>
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <ProfileImageUpload
              label="Product Logo"
              onFileChange={handleLogoChange}
              removable
              fallbackInitials={(form.icon?.length ?? 0) <= 2 ? form.icon : undefined}
              initialPreviewUrl={previewUrl}
            />
            <ProductCard app={form} className="max-w-xs" />
          </div>
        </div>

        <div className="p-4">
          <TextareaField label="Description" value={form.description} onChange={(event) => onUpdate("description", event.target.value)} rows={3} showCharCount={false} placeholder="What does this product do?" />
        </div>
      </div>
    </section>
  );
}

const ProductEdit = () => {
  //#region Hooks
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const stateProductId = parseProductIdFromState(location.state);
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [form, setForm] = useState<AdminApplication | null>(null);
  const [originalForm, setOriginalForm] = useState<AdminApplication | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  //#endregion

  //#region Functions
  const goToDetails = (id: number, name?: string) => {
    const slug = toProductSlug(name || product?.productName) || String(id);
    navigate(PRODUCTS_PATHS.details(slug), { state: { productId: id } });
  };

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      let resolvedId = stateProductId;

      if (!resolvedId && params.slug) {
        const numeric = Number(params.slug);
        if (Number.isInteger(numeric) && numeric > 0) {
          resolvedId = numeric;
        } else {
          const listRes = await getProducts();
          const items = normalizeProductList(listRes.resultData);
          const slug = (params.slug ?? "").toLowerCase();
          const found = items.find((p) => {
            const nameSlug = toProductSlug(p.productName);
            return (
              nameSlug === slug ||
              nameSlug.replace(/-/g, "_") === slug ||
              String(p.productId) === params.slug
            );
          });
          if (found) {
            resolvedId = found.productId;
          }
        }
      }

      if (!resolvedId) {
        setLoading(false);
        setProduct(null);
        setForm(null);
        setOriginalForm(null);
        return;
      }

      const res = await getProductById(resolvedId);
      const item = normalizeProductApiItem(res.resultData);
      if (item) {
        const initialForm = toAdminApplication(item);
        setProduct(item);
        setForm(initialForm);
        setOriginalForm(initialForm);
        setLogoFile(null);
        setLogoRemoved(false);
        setTouched(false);
      } else {
        setProduct(null);
        setForm(null);
        setOriginalForm(null);
      }
    } catch (err) {
      console.error("Error fetching product for edit:", err);
      showToast("Failed to load product.", "error");
      setProduct(null);
      setForm(null);
      setOriginalForm(null);
    } finally {
      setLoading(false);
    }
  }, [stateProductId, params.slug, showToast]);

  const update = <K extends keyof AdminApplication>(
    key: K,
    value: AdminApplication[K],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setTouched(true);
  };

  const handleLogoFileChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      setLogoRemoved(false);
      const localUrl = URL.createObjectURL(file);
      update("icon", localUrl);
    } else {
      setLogoRemoved(true);
      update("icon", DEFAULT_PRODUCT_ICON);
    }
  };

  const handleCancel = async () => {
    const dirty =
      touched && JSON.stringify(form) !== JSON.stringify(originalForm);
    if (dirty) {
      const confirmed = await confirmAction({
        title: "Discard unsaved changes?",
        description:
          "You have unsaved changes to this product. Leaving now will discard them.",
        confirmLabel: "Discard changes",
        tone: "danger",
      });
      if (!confirmed) return;
    }
    if (product) {
      goToDetails(product.productId);
      return;
    }
    navigate(PRODUCTS_PATHS.list);
  };

  const handleSave = async () => {
    setTouched(true);
    if (!form || !product) return;
    const dirty =
      Boolean(logoFile) ||
      logoRemoved ||
      JSON.stringify(form) !== JSON.stringify(originalForm);
    if (!dirty) return;

    const errors = validateProductForm(form);
    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors).join("\n"), "error");
      return;
    }

    if (form.icon?.startsWith("blob:") && !logoFile && !logoRemoved) {
      showToast("Please select the product logo again before saving.", "error");
      return;
    }

    setSaving(true);
    try {
      let finalLogoUrl: string | null | undefined = toStoredProductLogoPath(product.logoUrl) ?? product.logoUrl;
      if (logoFile) {
        const uploadedPath = await uploadProductLogo(logoFile);
        finalLogoUrl = toStoredProductLogoPath(uploadedPath) ?? uploadedPath;
      } else if (logoRemoved) {
        finalLogoUrl = null;
      }

      const defaultAccessDays =
        form.licenseType === "free"
          ? 0
          : product.defaultAccessDays > 0
            ? product.defaultAccessDays
            : 365;
      const payload: ProductInputPayload = {
        productId: product.productId,
        productName: form.name.trim(),
        subCategoryName: form.category?.trim() || null,
        prodDescription: form.description?.trim() || null,
        externalPageUrl: form.productionUrl?.trim() || null,
        defaultAccessDays,
        logoUrl: finalLogoUrl,
        features: form.features,
        isActive: form.status === "active",
        isAvailable: form.status !== "coming-soon",
      };

      await updateProduct(payload);
      showToast(`${form.name} updated successfully.`);
      goToDetails(product.productId, form.name);
    } catch (err) {
      console.error("Error saving product:", err);
      showToast(typeof err === "string" ? err : "Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);
  //#endregion

  if (loading) {
    return (
      <div className="admin-reveal flex flex-col gap-4" aria-busy="true">
        <div className="admin-skeleton h-12 w-full rounded-[var(--radius-panel)]" />
        <div className="admin-skeleton h-96 w-full rounded-[var(--radius-panel)]" />
      </div>
    );
  }

  if (!product || !form) {
    return (
      <div className="admin-reveal flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="text-4xl">{DEFAULT_PRODUCT_ICON}</span>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Product Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          The requested product could not be located in the database.
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

  const errors = validateProductForm(form);
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty =
    Boolean(logoFile) ||
    logoRemoved ||
    JSON.stringify(form) !== JSON.stringify(originalForm);
  const canSave = isDirty && !hasErrors && !saving;

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Edit Product"
        action={<MandatoryIndicator variant="brand" />}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSave) return;
          void handleSave();
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        <ProductForm
          form={form}
          errors={errors}
          touched={touched}
          onUpdate={update}
          onLogoFileChange={handleLogoFileChange}
        />

        <div className="admin-sticky-footer">
          <CommonButton
            variant="outline"
            size="sm"
            iconLeft={<X size={14} />}
            onClick={() => void handleCancel()}
          >
            Cancel
          </CommonButton>
          <CommonButton
            variant="primary"
            size="sm"
            iconLeft={<Save size={14} />}
            onClick={() => void handleSave()}
            disabled={!canSave}
          >
            {saving ? "Saving..." : "Save"}
          </CommonButton>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
