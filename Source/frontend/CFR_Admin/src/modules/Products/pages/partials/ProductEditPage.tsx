import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { useToast } from "@shared/app/components/ToastProvider";
import { CommonButton } from "@app/components/buttons";
import { MandatoryIndicator } from "@app/components/formControls";
import { confirmAction } from "@/modules/lib/confirm";
import { validateProductForm } from "../../validator/productValidation";
import { getProductById, updateProduct, uploadProductLogo } from "../../services/productService";
import type {
  ProductApiItem,
  ProductInputPayload,
} from "../../types/productTypes";
import { ProductForm } from "./ProductForm";
import {
  deriveProductStatus,
  getProductTheme,
} from "../../utils/productHelpers";
import type { AdminApplication } from "@/modules/types";

export function ProductEditPage() {
  //#region Hooks
  const { appId, productId } = useParams();
  const id = productId ?? appId;
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
  const loadProduct = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const numericId = Number(id);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        const res = await getProductById(numericId);
        if (res.resultData) {
          const item = res.resultData as ProductApiItem;
          const theme = getProductTheme(item.productName, item.subCategoryName);
          const initialForm: AdminApplication = {
            id: String(item.productId),
            name: item.productName,
            shortName: item.productName,
            category: item.subCategoryName || "General",
            icon: item.logoUrl || theme.icon,
            gradient: theme.gradient,
            description: item.prodDescription || "",
            features: item.features ?? [],
            productionUrl: item.externalPageUrl || "",
            ownership: "first-party",
            deploymentModel: "external-saas",
            licenseType: item.defaultAccessDays === 0 ? "free" : "licensed",
            navigationTarget: "same-tab",
            status: deriveProductStatus(item),
            registryRef: `reg_app_${String(item.productId).padStart(4, "0")}`,
            sourceLocation: `SaaS_Apps/${item.productName.toLowerCase().replace(/\s+/g, "-")}`,
            updatedAt: item.updatedDate || item.createdDate,
          };
          setProduct(item);
          setForm(initialForm);
          setOriginalForm(initialForm);
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
    } else {
      setLoading(false);
    }
  }, [id, showToast]);

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
      const theme = getProductTheme(form?.name || "", form?.category || "");
      update("icon", theme.icon);
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
    navigate(`/admin/products/${id}`);
  };

  const handleSave = async () => {
    setTouched(true);
    if (!form || !product) return;

    const errors = validateProductForm(form);
    if (Object.keys(errors).length > 0) return;

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
      navigate(`/admin/products/${id}`);
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
        <span className="text-4xl">📦</span>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Product Not Found
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          The requested product could not be located in the database.
        </p>
        <CommonButton
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/products")}
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
}

export default ProductEditPage;
