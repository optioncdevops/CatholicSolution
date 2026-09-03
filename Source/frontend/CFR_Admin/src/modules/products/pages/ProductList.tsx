import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, Pencil, RefreshCw, Search } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { EmptyState } from "@shared/app/components/EmptyState";
import { useToast } from "@shared/app/components/ToastProvider";
import { CommonButton, CommonIconButton } from "@app/components/buttons";
import { InputField, Dropdown } from "@app/components/formControls";
import { StatusBadge } from "@app/components/Badge";
import { BaseModal } from "@app/components/modal/BaseModal";
import { formatDate } from "@/modules/utils/formatDate";
import { confirmAction } from "@/modules/lib/confirm";
import { STATUS_IMPACT, CHANGE_STATUS_DESCRIPTION } from "../validator/productValidation";
import { getProducts, updateProduct } from "../services/productService";
import type {
  ProductApiItem,
  ProductInputPayload,
} from "../types/productTypes";
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
  PRODUCT_MODAL_STATUS_OPTIONS,
  type ProductStatusFilter,
  type ProductSortOption,
} from "../utils/productFilters";
import type { AdminApplication, ProductStatus } from "@/modules/types";



function ProductStatusDialog({
  app,
  onClose,
  onConfirm,
  pendingStatus,
  onSelectStatus,
}: {
  app: AdminApplication | null;
  onClose: () => void;
  onConfirm: (status: ProductStatus) => void;
  pendingStatus: ProductStatus | null;
  onSelectStatus: (status: ProductStatus | null) => void;
}) {
  const commitStatusChange = async () => {
    if (!pendingStatus) return;
    const confirmed = await confirmAction({
      title: `Set status to "${pendingStatus.replace("-", " ")}"?`,
      description: STATUS_IMPACT[pendingStatus],
      confirmLabel: "Confirm status change",
      tone: pendingStatus === "inactive" ? "danger" : "primary",
    });
    if (confirmed) onConfirm(pendingStatus);
  };

  return (
    <BaseModal
      isOpen={Boolean(app)}
      onClose={onClose}
      title={app ? `Change Status — ${app.name}` : ""}
      size="sm"
      closeOnOverlayClick={false}
      autoFocus={false}
      footer={
        <>
          <CommonButton variant="outline" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton
            variant="primary"
            disabled={!pendingStatus || pendingStatus === app?.status}
            onClick={() => void commitStatusChange()}
          >
            Continue
          </CommonButton>
        </>
      }
    >
      {app ? (
        <div className="flex flex-col gap-3.5">
          <p className="text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
            {CHANGE_STATUS_DESCRIPTION}
          </p>
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">New Status</legend>
            {PRODUCT_MODAL_STATUS_OPTIONS.map((status) => {
              const isCurrent = status === app.status;
              const isSelected = pendingStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onSelectStatus(status)}
                  disabled={isCurrent}
                  aria-pressed={isSelected}
                  className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left transition-all ${
                    isCurrent
                      ? "border-[var(--line-soft)] bg-[var(--surface-muted)] opacity-70 cursor-not-allowed"
                      : isSelected
                        ? "border-[var(--primary)] bg-[var(--primary-muted)] shadow-xs ring-2 ring-[var(--primary)]/20 cursor-pointer"
                        : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--primary)]/60 hover:bg-[var(--hover)] cursor-pointer"
                  }`}
                >
                  <StatusBadge status={status} kind="application" />
                  {isCurrent ? (
                    <span className="rounded-full border border-[var(--line-soft)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      Current
                    </span>
                  ) : isSelected ? (
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]">
                      <span className="size-1.5 rounded-full bg-[var(--surface)]" />
                    </span>
                  ) : (
                    <span className="size-4 shrink-0 rounded-full border-2 border-[var(--line-strong)]" />
                  )}
                </button>
              );
            })}
          </fieldset>
        </div>
      ) : null}
    </BaseModal>
  );
}

const ProductList = () => {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
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
    if (!selectedProduct) return;
    try {
      const payload: ProductInputPayload = {
        productId: selectedProduct.productId,
        productName: selectedProduct.productName,
        subCategoryName: selectedProduct.subCategoryName,
        prodDescription: selectedProduct.prodDescription,
        externalPageUrl: selectedProduct.externalPageUrl,
        defaultAccessDays: selectedProduct.defaultAccessDays,
        isActive: status === "active",
        isAvailable: status !== "coming-soon",
        contactPerson: selectedProduct.contactPerson,
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
              item.logoUrl,
              item.updatedDate,
            );

            return (
              <article
                key={item.productId}
                className="admin-product-card relative"
              >
                <div className="absolute right-[0.85rem] top-3">
                  <StatusBadge status={status} kind="application" />
                </div>

                <div
                  className="flex cursor-pointer items-center gap-2.5 pr-16 transition-opacity hover:opacity-90"
                  onClick={() => goToDetails(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      goToDetails(item);
                    }
                  }}
                >
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt=""
                      className="size-9 shrink-0 rounded-lg object-cover"
                      aria-hidden="true"
                    />
                  ) : (
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white"
                      style={{ background: DEFAULT_PRODUCT_GRADIENT }}
                      aria-hidden="true"
                    >
                      {DEFAULT_PRODUCT_ICON}
                    </span>
                  )}
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-extrabold text-[var(--text-primary)] hover:underline">
                      {item.productName}
                    </span>
                    <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">
                      {item.subCategoryName || "General"}
                    </span>
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
        <ProductStatusDialog
          app={{
            id: String(selectedProduct.productId),
            name: selectedProduct.productName,
            shortName: selectedProduct.productName,
            category: selectedProduct.subCategoryName || "General",
            icon:
              resolveProductLogoUrl(selectedProduct.logoUrl) ||
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
            sourceLocation: `SaaS_Apps/${selectedProduct.productName.toLowerCase().replace(/\s+/g, "-")}`,
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
