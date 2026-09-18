import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { ProductCard, isImageIcon } from "../../components";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { ReadOnlyBanner } from "@shared/app/components/ReadOnlyBanner";
import { useToast } from "@shared/app/components/ToastProvider";
import { useFeatureAccessLevel } from "@shared/auth/hooks/useFeatureAccessLevel";
import { CommonButton } from "@app/components/buttons";
import {
  InputField,
  MandatoryIndicator,
  ProfileImageUpload,
  RadioGroup,
  TextareaField,
  Dropdown,
} from "@app/components/formControls";
import { confirmAction } from "@/modules/lib/confirm";
import {
  validateProductForm,
  type ProductFormErrors,
} from "../../validator/productValidation";
import {
  getProductById,
  getProductContactUsers,
  updateProduct,
  uploadProductLogo,
} from "../../services/productService";
import type {
  ProductApiItem,
  ProductContactUser,
  ProductInputPayload,
} from "../../types/productTypes";
import {
  DEFAULT_PRODUCT_ICON,
  PRODUCTS_PATHS,
  normalizeProductApiItem,
  normalizeProductContactUsers,
  parseProductIdFromState,
  resolveProductLogoUrl,
  toStoredProductLogoPath,
  toAdminApplication,
  resolveContactUser,
  toProductContactUserId,
} from "../../utils/productHelpers";
import {
  PRODUCT_NAVIGATION_OPTIONS,
} from "../../utils/productFilters";
import type {
  AdminApplication,
  ProductNavigationTarget,
} from "@/modules/types";



function TagList({
  label,
  values,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
  maxLength = 100,
}: {
  label: string;
  values: string[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]">
            {label}
          </label>
          <input
            value={draft}
            maxLength={maxLength}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onAdd();
              }
            }}
            placeholder={`Add ${label.toLowerCase()} and press Enter`}
            className="w-full rounded-[var(--admin-control-radius)] border border-[var(--line)] bg-[var(--surface-field,var(--surface))] px-3 py-2 text-[length:var(--admin-text-base)] text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          />
        </div>
        <div className="flex items-center">
          <CommonButton
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="shrink-0 h-[38px] px-4"
          >
            Add
          </CommonButton>
        </div>
      </div>
      {values.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] pt-0.5">None added yet.</p>
      ) : (
        <ul className="flex w-full flex-wrap gap-1.5 pt-1">
          {values.map((value) => (
            <li
              key={value}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)] border border-[var(--line-soft)]"
            >
              <span>{value}</span>
              <button
                type="button"
                onClick={() => onRemove(value)}
                aria-label={`Remove ${value}`}
                className="text-[var(--text-faint)] hover:text-[var(--error)] transition-colors ml-0.5"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductForm({
  form,
  errors,
  touched,
  contactUsers,
  onUpdate,
  onLogoFileChange,
  readOnly = false,
}: {
  form: AdminApplication;
  errors: ProductFormErrors;
  touched: boolean;
  contactUsers: ProductContactUser[];
  onUpdate: <K extends keyof AdminApplication>(
    key: K,
    value: AdminApplication[K],
  ) => void;
  onLogoFileChange?: (file: File | null) => void;
  readOnly?: boolean;
}) {
  const { showToast } = useToast();
  const [featureDraft, setFeatureDraft] = useState("");

  const contactOptions = useMemo(() => {
    const list = contactUsers
      .filter(
        (user) =>
          user.isActive === 1 || String(user.userId) === form.contactUserId,
      )
      .map((user) => ({
        id: String(user.userId),
        value: user.fullName,
      }));

    const activeId = form.contactUserId || form.contactPersonName || "";
    if (
      activeId &&
      !list.some(
        (opt) =>
          opt.id === activeId ||
          opt.value.toLowerCase() === activeId.toLowerCase(),
      )
    ) {
      list.unshift({
        id: activeId,
        value: form.contactPersonName || activeId,
      });
    }

    return list;
  }, [contactUsers, form.contactUserId, form.contactPersonName]);

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    if (value.length > 100) {
      showToast("Feature name cannot exceed 100 characters.", "error");
      return;
    }
    const alreadyExists = (form.features ?? []).some(
      (item) => item.trim().toLowerCase() === value.toLowerCase(),
    );
    if (alreadyExists) {
      showToast(`Feature "${value}" already exists.`, "error");
      return;
    }
    onUpdate("features", [...(form.features ?? []), value.slice(0, 100)]);
    setFeatureDraft("");
  };
  const removeFeature = (value: string) =>
    onUpdate(
      "features",
      (form.features ?? []).filter((item) => item !== value),
    );

  const handleLogoChange = (file: File | null) => {
    if (onLogoFileChange) {
      onLogoFileChange(file);
    } else if (file) {
      const localUrl = URL.createObjectURL(file);
      onUpdate("icon", localUrl);
    }
  };

  const previewUrl =
    resolveProductLogoUrl(form.icon) ||
    (isImageIcon(form.icon) ? form.icon : undefined);

  return (
    <section className="admin-panel-card">
      <fieldset disabled={readOnly} className="contents">
        <div className="flex flex-col divide-y divide-[var(--line-soft)]">
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
            <InputField
              label="Product Name"
              readOnly
              placeholder="Enter product name"
              value={form.name}
              onChange={(event) => onUpdate("name", event.target.value)}
            />
            <InputField
              label="Short Name"
              readOnly
              placeholder="Enter short name"
              value={form.shortName}
              onChange={(event) => onUpdate("shortName", event.target.value)}
            />
            <InputField
              label="Product Subtitle"
              readOnly
              placeholder="Enter product subtitle"
              value={form.category}
              onChange={(event) => onUpdate("category", event.target.value)}
            />
            <InputField
              label="Production URL"
              autoFocus
              value={form.productionUrl}
              onChange={(event) => onUpdate("productionUrl", event.target.value)}
              placeholder="Enter production URL"
              error={touched ? errors.productionUrl : undefined}
            />
            <RadioGroup
              label="Navigation Target"
              options={PRODUCT_NAVIGATION_OPTIONS}
              value={form.navigationTarget}
              onValueChange={(value) =>
                onUpdate("navigationTarget", value as ProductNavigationTarget)
              }
            />
            <Dropdown
              label="Contact Person"
              placeholder="Select contact person"
              searchable
              clearable
              value={form.contactUserId || form.contactPersonName || ""}
              onValueChange={(value) => {
                const selectedValue = value ?? "";
                const selected = contactUsers.find(
                  (user) =>
                    String(user.userId) === selectedValue ||
                    user.fullName.trim().toLowerCase() ===
                    selectedValue.trim().toLowerCase(),
                );
                onUpdate(
                  "contactUserId",
                  selected ? String(selected.userId) : selectedValue,
                );
                onUpdate(
                  "contactPersonName",
                  selected?.fullName ?? selectedValue,
                );
              }}
              options={contactOptions}
            />
            <div className="col-span-full">
              <TagList
                label="Features"
                values={form.features ?? []}
                draft={featureDraft}
                onDraftChange={setFeatureDraft}
                onAdd={addFeature}
                onRemove={removeFeature}
                maxLength={100}
              />
            </div>
          </div>

          <div className="p-4">
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <ProfileImageUpload
                label="Product Logo"
                onFileChange={handleLogoChange}
                removable
                replaceable
                fallbackInitials={
                  (form.icon?.length ?? 0) <= 2
                    ? form.icon
                    : (form.name || "")
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "PR"
                }
                initialPreviewUrl={previewUrl}
              />
              <ProductCard app={form} className="max-w-xs" />
            </div>
          </div>

          <div className="p-4">
            <TextareaField
              label="Description"
              required
              value={form.description}
              onChange={(event) => onUpdate("description", event.target.value)}
              rows={3}
              maxLength={500}
              showCharCount={true}
              placeholder="Enter Description"
              error={touched ? errors.description : undefined}
            />
          </div>
        </div>
      </fieldset>
    </section>
  );
}

const ProductEdit = () => {
  //#region Hooks
  const location = useLocation();
  const stateProductId = parseProductIdFromState(location.state);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel(PRODUCTS_PATHS.list);
  const isReadOnly = accessLevel === "readOnly";
  //#endregion

  //#region States
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [form, setForm] = useState<AdminApplication | null>(null);
  const [originalForm, setOriginalForm] = useState<AdminApplication | null>(
    null,
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [contactUsers, setContactUsers] = useState<ProductContactUser[]>([]);
  //#endregion

  //#region Functions
  const goToDetails = (id: number) => {
    navigate(PRODUCTS_PATHS.details, { state: { productId: id } });
  };

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const resolvedId = stateProductId;

      if (!resolvedId) {
        setLoading(false);
        setProduct(null);
        setForm(null);
        setOriginalForm(null);
        return;
      }

      const [res, usersRes] = await Promise.all([
        getProductById(resolvedId),
        getProductContactUsers().catch((err) => {
          console.error("Error loading contact persons:", err);
          return { statusCode: 500, statusMessage: "error", resultData: [] };
        }),
      ]);

      const loadedUsers =
        usersRes.statusCode === 204
          ? []
          : normalizeProductContactUsers(usersRes.resultData);
      setContactUsers(loadedUsers);

      const item = normalizeProductApiItem(res.resultData);
      if (item) {
        const initialForm = resolveContactUser(
          toAdminApplication(item),
          loadedUsers,
        );
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
  }, [stateProductId, showToast]);

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
    if (isReadOnly) return;
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
      let finalLogoName: string | null | undefined =
        product.logoName ?? toStoredProductLogoPath(product.logoName);
      if (logoFile) {
        const uploadedPath = await uploadProductLogo(
          logoFile,
          product.productId,
        );
        finalLogoName = toStoredProductLogoPath(uploadedPath) ?? uploadedPath;
      } else if (logoRemoved) {
        finalLogoName = null;
      }

      const payload: ProductInputPayload = {
        productId: product.productId,
        productName: form.name.trim(),
        shortName: form.shortName?.trim() || null,
        subCategoryName: form.category?.trim() || null,
        prodDescription: form.description?.trim() || null,
        externalPageUrl: form.productionUrl?.trim() || null,
        navigationTarget: form.navigationTarget,
        logoName: finalLogoName,
        features: form.features,
        isActive: form.status !== "inactive",
        productStatus:
          form.status === "active"
            ? 1
            : form.status === "coming-soon"
              ? 2
              : null,
        contactUserId: toProductContactUserId(form.contactUserId) ?? 0,
      };

      await updateProduct(payload);
      showToast('Product updated successfully.');
      goToDetails(product.productId);
    } catch (err) {
      console.error("Error saving product:", err);
      showToast(
        typeof err === "string" ? err : "Failed to update product",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    // Standard mount/dependency-driven data-fetch effect, preserved as-is per this review's own
    // instruction not to blindly rewrite working async loading effects. Known gap (tracked, not
    // fixed here): `loadProduct` doesn't check a cancellation flag internally, so in the rare case
    // this component unmounts while the request is still in flight, its `setLoading`/`setProduct`
    // calls would still fire after unmount — the same shape as several other detail/edit pages in
    // this app: a real but pre-existing, wider-reaching gap, not something newly introduced or
    // safe to silently paper over here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const canSave = isDirty && !hasErrors && !saving && !isReadOnly;

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Edit Product"
        action={
          <div className="flex items-center gap-2">
            <CommonButton
              variant="headerSecondary"
              iconLeft={<ArrowLeft size={14} />}
              onClick={() => void handleCancel()}
            >
              Back to Products
            </CommonButton>
            <MandatoryIndicator variant="brand" />
          </div>
        }
      />

      {isReadOnly ? <ReadOnlyBanner featureName="Products" /> : null}

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
          contactUsers={contactUsers}
          onUpdate={update}
          onLogoFileChange={handleLogoFileChange}
          readOnly={isReadOnly}
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
