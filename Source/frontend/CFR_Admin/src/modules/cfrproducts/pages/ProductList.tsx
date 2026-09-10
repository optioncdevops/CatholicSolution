import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, Pencil, RefreshCw, Search } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { EmptyState } from "@shared/app/components/EmptyState";
import { ReadOnlyBanner } from "@shared/app/components/ReadOnlyBanner";
import { useToast } from "@shared/app/components/ToastProvider";
import { useFeatureAccessLevel } from "@shared/auth/hooks/useFeatureAccessLevel";
import { CommonIconButton } from "@app/components/buttons";
import { InputField, Dropdown } from "@app/components/formControls";
import { StatusBadge } from "@app/components/Badge";
import { formatDate } from "@/modules/utils/formatDate";
import { getProducts, updateProduct } from "../services/productService";
import type {
  ProductApiItem,
  ProductInputPayload,
} from "../types/productTypes";
import { EntityAvatar } from "@app/components/EntityAvatar";
import {
  DEFAULT_PRODUCT_GRADIENT,
  DEFAULT_PRODUCT_ICON,
  PRODUCTS_PATHS,
  deriveProductStatus,
  formatProductCustomerCount,
  normalizeProductList,
  resolveProductLogoUrl,
} from "../utils/productHelpers";
import {
  PRODUCT_STATUS_FILTERS,
  PRODUCT_SORT_OPTIONS,
  type ProductStatusFilter,
  type ProductSortOption,
} from "../utils/productFilters";
import type { ProductStatus } from "@/modules/types";
import { ProductStatusModal } from "./partials/ProductStatusModal";

const ProductItemLogo = ({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setHasError(true)}
        className="size-9 shrink-0 rounded-lg object-cover"
        aria-hidden="true"
      />
    );
  }

  return <EntityAvatar name={name} size={36} square />;
};

const ProductList = () => {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel(PRODUCTS_PATHS.list);
  const isReadOnly = accessLevel === "readOnly";
  //#endregion

  //#region States
  const [products, setProducts] = useState<ProductApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");
  const [sortBy, setSortBy] = useState<ProductSortOption>("default");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductApiItem | null>(
    null,
  );
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(
    null,
  );
  //#endregion

  //#region Functions
  const load = useCallback(async () => {
    try {
      const { resultData, statusCode } = await getProducts();
      setProducts(statusCode === 204 ? [] : normalizeProductList(resultData));
    } catch (error) {
      console.error("Error loading products:", error);
      showToast("Failed to load products.", "error");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const goToDetails = (item: ProductApiItem) => {
    navigate(PRODUCTS_PATHS.details, {
      state: { productId: item.productId },
    });
  };

  const goToEdit = (item: ProductApiItem) => {
    navigate(PRODUCTS_PATHS.edit, {
      state: { productId: item.productId },
    });
  };

  const handleConfirmStatus = async (status: ProductStatus) => {
    if (!selectedProduct || isReadOnly) return;
    try {
      const isActive = status !== "inactive";
      const productStatus =
        status === "active" ? 1 : status === "coming-soon" ? 2 : null;
      const payload: ProductInputPayload = {
        productId: selectedProduct.productId,
        productName: selectedProduct.productName,
        subCategoryName: selectedProduct.subCategoryName,
        prodDescription: selectedProduct.prodDescription,
        externalPageUrl: selectedProduct.externalPageUrl,
        defaultAccessDays: selectedProduct.defaultAccessDays,
        licenseType: selectedProduct.licenseType,
        navigationTarget: selectedProduct.navigationTarget,
        isActive,
        productStatus,
        contactUserId: selectedProduct.contactUserId,
      };
      await updateProduct(payload);
      showToast(
        `${selectedProduct.productName} status changed to ${status.replace("-", " ")}.`,
      );
      await load();
    } catch (error) {
      showToast(
        typeof error === "string" ? error : "Failed to change status",
        "error",
      );
    } finally {
      setStatusDialogOpen(false);
      setSelectedProduct(null);
      setPendingStatus(null);
    }
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    void load();
  }, [load]);
  //#endregion

  //#region Handlers
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = products
      .filter((item) => {
        if (statusFilter === "all") return true;
        return deriveProductStatus(item) === statusFilter;
      })
      .filter((item) => {
        if (!normalized) return true;
        return [
          item.productName,
          item.subCategoryName ?? "",
          item.prodDescription ?? "",
          item.externalPageUrl ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      });

    const sorted = [...filtered];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (sortBy === "customers") {
      sorted.sort((a, b) => b.customerCount - a.customerCount);
    } else if (sortBy === "updated") {
      sorted.sort((a, b) => {
        const dateA = a.updatedDate || a.createdDate;
        const dateB = b.updatedDate || b.createdDate;
        return dateB.localeCompare(dateA);
      });
    } else {
      sorted.sort((a, b) => a.productId - b.productId);
    }
    return sorted;
  }, [products, query, statusFilter, sortBy]);
  //#endregion

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-2.5">
      <PanelHeader title="Products" />

      {isReadOnly ? <ReadOnlyBanner featureName="Products" /> : null}

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5">
        <InputField
          label="Search products"
          hideLabel
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, subtitle, domain"
          startIcon={<Search size={13} />}
          className="min-h-8 text-xs placeholder:text-xs"
          wrapperClassName="min-w-[200px] max-w-xs shrink-0"
        />

        <div className="flex shrink-0 flex-nowrap gap-1.5">
          {PRODUCT_STATUS_FILTERS.map((filter) => {
            const count =
              filter.id === "all"
                ? products.length
                : products.filter(
                    (item) => deriveProductStatus(item) === filter.id,
                  ).length;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatusFilter(filter.id)}
                className={`admin-filter-chip ${statusFilter === filter.id ? "admin-filter-chip--active" : ""}`}
              >
                {filter.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="w-40 shrink-0">
          <Dropdown
            label="Sort by"
            hideLabel
            searchable={false}
            clearable={false}
            value={sortBy}
            onValueChange={(value) =>
              setSortBy((value as ProductSortOption) ?? "default")
            }
            options={PRODUCT_SORT_OPTIONS.map((option) => ({
              id: option.id,
              value: option.label,
            }))}
            className="min-h-8"
          />
        </div>
      </div>

      {loading ? (
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Loading products"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="admin-skeleton h-36 w-full rounded-[var(--radius-panel)]"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="No products found"
          description="Try a different search term or filter combination."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((item) => {
            const status = deriveProductStatus(item);
            const logoSrc = resolveProductLogoUrl(
              item.logoName,
              item.updatedDate,
            );

            return (
              <article
                key={item.productId}
                className="admin-product-card"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div
                    className="flex min-w-0 cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
                    onClick={() => goToDetails(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        goToDetails(item);
                      }
                    }}
                  >
                    <ProductItemLogo src={logoSrc} name={item.productName} />
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-[var(--text-primary)] hover:underline">
                        {item.productName}
                      </span>
                      <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">
                        {item.subCategoryName || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <StatusBadge status={status} kind="application" />
                  </div>
                </div>

                <p
                  className="admin-product-card__description"
                  title={item.prodDescription ?? ""}
                >
                  {item.prodDescription || "No description yet."}
                </p>

                <div className="mt-auto">
                  <div className="admin-product-card__divider" />

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    <Building2 size={13} className="text-[var(--text-faint)]" />
                    {formatProductCustomerCount(item.customerCount)}
                  </span>

                  <div className="admin-product-card__footer">
                    <span className="truncate text-xs font-semibold text-[var(--text-faint)]">
                      Updated {formatDate(item.updatedDate || item.createdDate)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <CommonIconButton
                        aria-label={`View ${item.productName}`}
                        tooltip="View"
                        icon={<Eye size={14} />}
                        onClick={() => goToDetails(item)}
                      />
                      <CommonIconButton
                        aria-label={`Edit ${item.productName}`}
                        tooltip="Edit"
                        icon={<Pencil size={14} />}
                        onClick={() => goToEdit(item)}
                      />
                      <CommonIconButton
                        aria-label={`Change status for ${item.productName}`}
                        tooltip="Change Status"
                        icon={<RefreshCw size={14} />}
                        onClick={() => {
                          setSelectedProduct(item);
                          setPendingStatus(null);
                          setStatusDialogOpen(true);
                        }}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedProduct && statusDialogOpen && (
        <ProductStatusModal
          app={{
            id: String(selectedProduct.productId),
            name: selectedProduct.productName,
            shortName: selectedProduct.productName,
            category: selectedProduct.subCategoryName || "General",
            icon:
              resolveProductLogoUrl(selectedProduct.logoName) ||
              DEFAULT_PRODUCT_ICON,
            gradient: DEFAULT_PRODUCT_GRADIENT,
            description: selectedProduct.prodDescription || "",
            status: deriveProductStatus(selectedProduct),
            features: [],
            productionUrl: selectedProduct.externalPageUrl || "",
            ownership: "first-party",
            deploymentModel: "external-saas",
            licenseType: "licensed",
            navigationTarget: "same-tab",
            registryRef: `reg_app_${String(selectedProduct.productId).padStart(4, "0")}`,
            sourceLocation: selectedProduct.productName.toLowerCase().replace(/\s+/g, "-"),
            updatedAt:
              selectedProduct.updatedDate || selectedProduct.createdDate,
          }}
          pendingStatus={pendingStatus}
          onSelectStatus={setPendingStatus}
          onClose={() => {
            setStatusDialogOpen(false);
            setSelectedProduct(null);
            setPendingStatus(null);
          }}
          onConfirm={handleConfirmStatus}
        />
      )}
    </div>
  );
  //#endregion
};

export default ProductList;
