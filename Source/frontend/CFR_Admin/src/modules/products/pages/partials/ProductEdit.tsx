import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Save, X } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { useToast } from "@shared/app/components/ToastProvider";
import { CommonButton } from "@app/components/buttons";
import { MandatoryIndicator } from "@app/components/formControls";
import { confirmAction } from "@/modules/lib/confirm";
import { validateProductForm } from "../../validator/productValidation";
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
import { ProductForm } from "./ProductForm";
import {
  DEFAULT_PRODUCT_ICON,
  PRODUCTS_PATHS,
  normalizeProductList,
  parseProductIdFromState,
  toAdminApplication,
  toProductSlug,
} from "../../utils/productHelpers";
import type { AdminApplication } from "@/modules/types";

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
  const [originalForm, setOriginalForm] = useState<AdminApplication | null>(
    null,
  );
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
          const found = items.find(
            (p) => toProductSlug(p.productName) === params.slug || String(p.productId) === params.slug,
          );
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
      if (res.resultData) {
        const item = res.resultData as ProductApiItem;
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

    const errors = validateProductForm(form);
    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors).join("\n"), "error");
      return;
    }

    setSaving(true);
    try {
      let finalLogoUrl: string | null | undefined = product.logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadProductLogo(logoFile);
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

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title="Edit Product"
        action={<MandatoryIndicator variant="brand" />}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
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
            disabled={hasErrors || saving}
          >
            {saving ? "Saving..." : "Save"}
          </CommonButton>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
