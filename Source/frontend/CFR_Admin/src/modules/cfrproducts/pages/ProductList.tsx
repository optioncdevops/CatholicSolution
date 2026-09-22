import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, Pencil, RefreshCw, Search } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { EmptyState } from "@shared/app/components/EmptyState";
import { ReadOnlyBanner } from "@shared/app/components/ReadOnlyBanner";
import { useToast } from "@shared/app/components/ToastProvider";
import { useFeatureAccessLevel } from "@/modules/authentication/hooks/useFeatureAccessLevel";
import { CommonButton, CommonIconButton } from "@app/components/buttons";
import { InputField, Dropdown } from "@app/components/formControls";
import { StatusBadge } from "@app/components/Badge";
import { formatDateTime } from "@/modules/utils/formatDate";
import { getProducts, updateProduct } from "../services/productService";
import type {
  ProductApiItem,
  ProductInputPayload,
} from "../types/productTypes";
import {
  PRODUCTS_PATHS,
  deriveProductStatus,
  formatProductCustomerCount,
  normalizeProductList,
  resolveProductLogoUrl,
  toAdminApplication,
} from "../utils/productHelpers";
import {
  PRODUCT_STATUS_FILTERS,
  PRODUCT_SORT_OPTIONS,
  type ProductStatusFilter,
  type ProductSortOption,
} from "../utils/productFilters";
import type { ProductStatus } from "@/modules/types";
import { ProductStatusModal } from "./partials/ProductStatusModal";
import { ProductIcon } from "../components";

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
  const [refreshing, setRefreshing] = useState(false);
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
  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { resultData, statusCode } = await getProducts();
      setProducts(statusCode === 204 ? [] : normalizeProductList(resultData));
      if (isRefresh) showToast("Products refreshed.", "success");
    } catch (error) {
      console.error("Error loading products:", error);
      showToast("Failed to load products.", "error");
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  const goToDetails = (item: ProductApiItem) => {
    if (item.navigationTarget === 'new-tab') {
      window.open(`${PRODUCTS_PATHS.details}?productId=${item.productId}`, '_blank');
    } else {
      navigate(PRODUCTS_PATHS.details, {
        state: { productId: item.productId },
      });
    }
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
        navigationTarget: selectedProduct.navigationTarget,
        isActive,
        productStatus,
        contactUserId: selectedProduct.contactUserId,
      };
      await updateProduct(payload);
      showToast(
        `Product status changed to ${status.replace("-", " ")}.`,
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
    // Standard mount/dependency-driven data-fetch effect, preserved as-is per this review's own
    // instruction not to blindly rewrite working async loading effects. Known gap (tracked, not
    // fixed here): `load` doesn't check a cancellation flag internally, so in the rare case this
    // component unmounts while the request is still in flight, its setState calls would still
    // fire after unmount — a real but pre-existing, wider-reaching gap shared with several other
    // list pages in this app, not something newly introduced or safe to silently paper over here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  //#endregion

  //#region Handlers
  const handleRefresh = () => { void load(true); };

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
      <PanelHeader
        title="Products"
        action={
          <CommonButton
            variant="headerSecondary"
            iconLeft={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />}
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </CommonButton>
        }
      />

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
              item.productId,
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
                    <ProductIcon icon={logoSrc} name={item.productName} />
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
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate text-xs font-semibold text-[var(--text-faint)]">
                        Updated {formatDateTime(item.updatedDate || item.createdDate)}
                      </span>
                      {item.updatedByName ? (
                        <span className="truncate text-xs font-semibold text-[var(--text-faint)]">
                          By {item.updatedByName}
                        </span>
                      ) : null}
                    </div>
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
                      {!isReadOnly && (
                        <CommonIconButton
                          aria-label={`Change status for ${item.productName}`}
                          tooltip="Change Status"
                          icon={<RefreshCw size={14} />}
                          onClick={() => {
                            setSelectedProduct(item);
                            setPendingStatus(null);
                            setStatusDialogOpen(true);
                          }}
                        />
                      )}
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
          app={toAdminApplication(selectedProduct)}
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
