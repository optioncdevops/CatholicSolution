import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Pencil, RefreshCw } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { useToast } from "@shared/app/components/ToastProvider";
import { CommonButton } from "@app/components/buttons";
import { Tabs, TabPanel } from "@app/components/Tabs";
import { BaseModal } from "@app/components/modal/BaseModal";
import { StatusBadge } from "@app/components/Badge";
import { cn } from "@app/utilities/cn";
import { formatDate } from "@/modules/utils/formatDate";
import { confirmAction } from "@/modules/lib/confirm";
import {
  getProductWarnings,
  STATUS_IMPACT,
  CHANGE_STATUS_DESCRIPTION,
  type ProductWarning,
} from "../validator/productValidation";
import {
  getProductById,
  getProductCustomers,
  getProducts,
  updateProduct,
} from "../services/productService";
import type {
  ProductApiItem,
  ProductInputPayload,
} from "../types/productTypes";
import { CustomerDetails } from "./CustomerDetails";
import { LicenseDetails } from "./LicenseDetails";
import { LicenseHistory } from "./LicenseHistory";
import {
  DEFAULT_PRODUCT_GRADIENT,
  DEFAULT_PRODUCT_ICON,
  PRODUCTS_PATHS,
  normalizeProductList,
  normalizeProductApiItem,
  normalizeProductCustomerList,
  parseProductIdFromState,
  parseProductTabFromState,
  resolveProductLogoUrl,
  toAdminApplication,
  toProductSlug,
} from "../utils/productHelpers";
import type { AdminApplication, ProductStatus } from "@/modules/types";

function isImageIcon(icon: string): boolean {
  if (!icon) return false;
  return (
    icon.startsWith("data:") ||
    icon.startsWith("blob:") ||
    icon.startsWith("/") ||
    /^https?:\/\//i.test(icon)
  );
}

function ProductIcon({ icon, gradient }: { icon: string; gradient: string }) {
  if (isImageIcon(icon)) {
    const resolved =
      icon.startsWith("data:") ||
      icon.startsWith("blob:") ||
      /^https?:\/\//i.test(icon)
        ? icon
        : resolveProductLogoUrl(icon) || icon;
    return (
      <img
        src={resolved}
        alt=""
        className="size-9 shrink-0 rounded-lg object-cover"
        aria-hidden="true"
      />
    );
  }
  return (
    <span
      className="grid size-9 shrink-0 place-items-center rounded-lg text-sm text-white"
      style={{ background: gradient }}
      aria-hidden="true"
    >
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
  app: Pick<
    AdminApplication,
    "name" | "category" | "icon" | "gradient" | "description" | "status"
  >;
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
          <span
            className={cn(
              "truncate text-sm font-extrabold text-[var(--text-primary)]",
              linkTo && "group-hover:underline",
            )}
          >
            {app.name}
          </span>
          {warningCount > 0 ? (
            <span
              title={`${warningCount} data quality warning${warningCount === 1 ? "" : "s"}`}
              aria-label={`${warningCount} data quality warning${warningCount === 1 ? "" : "s"}`}
            >
              <AlertTriangle
                size={13}
                className="shrink-0 text-[var(--warning)]"
              />
            </span>
          ) : null}
        </span>
        <span className="block truncate text-xs font-semibold text-[var(--text-muted)]">
          {app.category}
        </span>
      </div>
    </>
  );

  return (
    <article
      className={cn(
        "admin-product-card relative",
        !linkTo && "admin-product-card--static",
        className,
      )}
    >
      <div className="absolute right-[0.85rem] top-3">
        <StatusBadge status={app.status} kind="application" />
      </div>
      <div className="flex items-center gap-2.5 pr-16">
        {linkTo ? (
          <Link to={linkTo} className="group flex min-w-0 items-center gap-2.5">
            {identity}
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">{identity}</div>
        )}
      </div>
      <p className="admin-product-card__description">
        {app.description || "No description yet."}
      </p>
      {footer ? (
        <div className="mt-auto">
          <div className="admin-product-card__divider" />
          {footer}
        </div>
      ) : null}
    </article>
  );
}

function ProductWarningsBanner({ warnings }: { warnings: ProductWarning[] }) {
  if (warnings.length === 0) return null;

  return (
    <div
      role="alert"
      className="flex flex-col gap-1.5 rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--warning-bg)] p-3"
    >
      <p className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--warning)]">
        <AlertTriangle size={14} /> {warnings.length} data quality{" "}
        {warnings.length === 1 ? "warning" : "warnings"}
      </p>
      <ul
        className="flex flex-col gap-1 pl-5 text-xs font-semibold text-[var(--warning)]"
        style={{ listStyleType: "disc" }}
      >
        {warnings.map((warning) => (
          <li key={warning.id}>{warning.message}</li>
        ))}
      </ul>
    </div>
  );
}

const STATUS_OPTIONS: ProductStatus[] = ["active", "inactive", "coming-soon"];

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
            {STATUS_OPTIONS.map((status) => {
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[0.8125rem] font-bold capitalize text-[var(--text-primary)]">
        {value || "—"}
      </p>
    </div>
  );
}

function WebsiteUrlFact({ url }: { url: string }) {
  return (
    <div className="min-w-0 sm:col-span-2">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
        Website URL
      </p>
      {url.trim() ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block break-all text-[0.8125rem] font-bold text-[var(--primary)] hover:underline"
          title={url}
        >
          {url}
        </a>
      ) : (
        <p className="mt-0.5 text-[0.8125rem] font-bold text-[var(--text-primary)]">
          Not configured
        </p>
      )}
    </div>
  );
}

function ProductDetailsTab({ app }: { app: AdminApplication }) {
  return (
    <section className="admin-panel-card">
      <div className="admin-panel-card__header">
        <h2 className="panel-title">Product Details</h2>
      </div>

      <div className="flex flex-col divide-y divide-[var(--line-soft)]">
        <div className="p-4">
          <p className="text-[0.8125rem] leading-6 text-[var(--text-secondary)]">
            {app.description || "No description yet."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
          <Fact label="Product Subtitle" value={app.category} />
          <Fact label="Status" value={app.status.replace("-", " ")} />
          <WebsiteUrlFact url={app.productionUrl} />
          <Fact label="License Type" value={app.licenseType} />
          <Fact label="Last updated" value={formatDate(app.updatedAt)} />
          <Fact label="Contact Person" value={app.contactPersonName || ""} />
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
            Features
          </p>
          {app.features.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              No features listed.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {app.features.map((feature) => (
                <li
                  key={feature}
                  className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]"
                >
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4">
          <p className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
            Product Preview
          </p>
          <ProductCard app={app} className="max-w-xs" />
        </div>
      </div>
    </section>
  );
}

const ProductDetails = () => {
  //#region Hooks
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const stateProductId = parseProductIdFromState(location.state);
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [product, setProduct] = useState<ProductApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(
    parseProductTabFromState(location.state) ?? "details",
  );
  const [changingStatus, setChangingStatus] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(
    null,
  );
  const [customerCount, setCustomerCount] = useState(0);
  //#endregion

  //#region Functions
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
            (p) =>
              toProductSlug(p.productName) === params.slug ||
              String(p.productId) === params.slug,
          );
          if (found) {
            resolvedId = found.productId;
          }
        }
      }

      if (!resolvedId) {
        setProduct(null);
        return;
      }

      const res = await getProductById(resolvedId);
      const item = normalizeProductApiItem(res.resultData);
      if (item) {
        setProduct(item);
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error("Error fetching product by ID:", err);
      showToast("Failed to load product details.", "error");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [stateProductId, params.slug, showToast]);

  const handleConfirmStatus = async (status: ProductStatus) => {
    if (!product) return;
    try {
      const payload: ProductInputPayload = {
        productId: product.productId,
        productName: product.productName,
        subCategoryName: product.subCategoryName,
        prodDescription: product.prodDescription,
        externalPageUrl: product.externalPageUrl,
        defaultAccessDays: product.defaultAccessDays,
        isActive: status === "active",
        isAvailable: status !== "coming-soon",
        contactPerson: product.contactPerson,
      };
      await updateProduct(payload);
      await loadProduct();
      showToast(
        `${product.productName} status changed to ${status.replace("-", " ")}.`,
      );
    } catch (error) {
      showToast(
        typeof error === "string" ? error : "Failed to change status",
        "error",
      );
    } finally {
      setChangingStatus(false);
      setPendingStatus(null);
    }
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    const tab = parseProductTabFromState(location.state);
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (!product?.productId) {
      setCustomerCount(0);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await getProductCustomers(product.productId);
        if (cancelled) return;
        setCustomerCount(normalizeProductCustomerList(res.resultData).length);
      } catch {
        if (!cancelled) {
          setCustomerCount(0);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [product?.productId]);
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

  const app = toAdminApplication(product);
  const logoSrc = resolveProductLogoUrl(product.logoUrl, product.updatedDate);
  const warnings = getProductWarnings(app, [app]);
  const slug = toProductSlug(product.productName) || String(product.productId);

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={app.name}
        icon={
          logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              className="size-9 shrink-0 rounded-xl object-cover"
              aria-hidden="true"
            />
          ) : (
            <span
              className="grid size-9 shrink-0 place-items-center rounded-xl text-base text-white"
              style={{ background: DEFAULT_PRODUCT_GRADIENT }}
              aria-hidden="true"
            >
              {DEFAULT_PRODUCT_ICON}
            </span>
          )
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CommonButton
              variant="headerSecondary"
              iconLeft={<RefreshCw size={14} />}
              onClick={() => setChangingStatus(true)}
            >
              Change Status
            </CommonButton>
            <CommonButton
              variant="headerSecondary"
              iconLeft={<Pencil size={14} />}
              onClick={() =>
                navigate(PRODUCTS_PATHS.edit(slug), {
                  state: { productId: product.productId },
                })
              }
            >
              Edit
            </CommonButton>
          </div>
        }
      />

      <ProductWarningsBanner warnings={warnings} />

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "details", label: "Product Details" },
          { id: "customers", label: "Customers", count: customerCount },
          { id: "invoice-details", label: "License Details" },
          { id: "invoice-history", label: "License History" },
        ]}
      />

      <TabPanel id="details" activeId={activeTab}>
        <ProductDetailsTab app={app} />
      </TabPanel>

      <TabPanel id="customers" activeId={activeTab}>
        <CustomerDetails app={app} onCountChange={setCustomerCount} />
      </TabPanel>

      <TabPanel id="invoice-details" activeId={activeTab}>
        <LicenseDetails app={app} />
      </TabPanel>

      <TabPanel id="invoice-history" activeId={activeTab}>
        <LicenseHistory app={app} />
      </TabPanel>

      <ProductStatusDialog
        app={changingStatus ? app : null}
        pendingStatus={pendingStatus}
        onSelectStatus={setPendingStatus}
        onClose={() => {
          setChangingStatus(false);
          setPendingStatus(null);
        }}
        onConfirm={handleConfirmStatus}
      />
    </div>
  );
};

export default ProductDetails;
