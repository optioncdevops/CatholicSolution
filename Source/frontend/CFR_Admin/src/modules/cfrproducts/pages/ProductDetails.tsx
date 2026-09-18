import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Pencil, RefreshCw } from "lucide-react";
import { PanelHeader } from "@shared/app/components/PanelHeader";
import { ReadOnlyBanner } from "@shared/app/components/ReadOnlyBanner";
import { useToast } from "@shared/app/components/ToastProvider";
import { useFeatureAccessLevel } from "@shared/auth/hooks/useFeatureAccessLevel";
import { CommonButton } from "@app/components/buttons";
import { Tabs, TabPanel } from "@app/components/Tabs";
import { formatDateTime } from "@/modules/utils/formatDate";
import {
  getProductWarnings,
  type ProductWarning,
} from "../validator/productValidation";
import {
  getProductById,
  updateProduct,
} from "../services/productService";
import type {
  ProductApiItem,
  ProductInputPayload,
} from "../types/productTypes";
import { CustomerDetails } from "./CustomerDetails";
import { LicenseDetails } from "./LicenseDetails";
import { LicenseHistory } from "./LicenseHistory";
import { ApiIntegrationDetails } from "./ApiIntegrationDetails";
import {
  DEFAULT_PRODUCT_ICON,
  PRODUCTS_PATHS,
  normalizeProductApiItem,
  parseProductIdFromState,
  parseProductTabFromState,
  resolveProductLogoUrl,
  toAdminApplication,
} from "../utils/productHelpers";
import type { AdminApplication, ProductStatus } from "@/modules/types";
import { ProductStatusModal } from "./partials/ProductStatusModal";
import { ProductCard, ProductIcon } from "../components";

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

function ProductionUrlFact({ url }: { url: string }) {
  const trimmed = (url ?? "").trim();
  const href = trimmed
    ? /^https?:\/\//i.test(trimmed)
      ? trimmed.replace(/^http:\/\//i, "https://")
      : `https://${trimmed}`
    : "";

  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
        Production URL
      </p>
      {trimmed ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block truncate text-[0.8125rem] font-bold text-[var(--primary)] hover:underline"
          title={href}
        >
          {href}
        </a>
      ) : (
        <p className="mt-0.5 truncate text-[0.8125rem] font-bold text-[var(--text-primary)]">
          Not configured
        </p>
      )}
    </div>
  );
}

function ProductDetailsTab({ app }: { app: AdminApplication }) {
  return (
    <section className="admin-panel-card">
      <div className="flex flex-col divide-y divide-[var(--line-soft)]">
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Fact label="Product Name" value={app.name} />
          <Fact label="Short Name" value={app.shortName} />
          <Fact label="Product Subtitle" value={app.category} />
          <ProductionUrlFact url={app.productionUrl} />
          <Fact
            label="Navigation Target"
            value={app.navigationTarget === "new-tab" ? "New Tab" : "Same Tab"}
          />
          <Fact label="Contact Person" value={app.contactPersonName || ""} />
          <Fact label="Status" value={app.status.replace("-", " ")} />
          <Fact label="Last Updated" value={formatDateTime(app.updatedAt)} />
          <Fact label="Last Updated By" value={app.updatedByName || ""} />
        </div>

        <div className="p-4">
          <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
            Description
          </p>
          <p className="text-[0.8125rem] leading-6 text-[var(--text-secondary)]">
            {app.description || "No description yet."}
          </p>
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
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.6875rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">
                Product Logo
              </span>
              <div className="flex size-18 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2">
                <ProductIcon icon={app.icon} name={app.name} size={44} />
              </div>
            </div>
            <ProductCard
              app={app}
              className="max-w-xs"
              footer={
                <div className="flex flex-col gap-0.5">
                  <span className="truncate text-xs font-semibold text-[var(--text-faint)]">
                    Updated {formatDateTime(app.updatedAt)}
                  </span>
                  {app.updatedByName ? (
                    <span className="truncate text-xs font-semibold text-[var(--text-faint)]">
                      By {app.updatedByName}
                    </span>
                  ) : null}
                </div>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const ProductDetails = () => {
  //#region Hooks
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchProductId = searchParams.get('productId');
  const stateProductId = parseProductIdFromState(location.state) || (searchProductId ? Number(searchProductId) : null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const accessLevel = useFeatureAccessLevel(PRODUCTS_PATHS.list);
  const isReadOnly = accessLevel === "readOnly";
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
  // Prop-driven reset, adjusted during render rather than in an effect (React's own recommended
  // pattern for "state that syncs from a navigation-carried value") — a fresh `location.state`
  // (e.g. arriving from a "View" link elsewhere that requests a specific tab) switches the active
  // tab; navigating again without a tab hint leaves the current tab alone, same as the effect did.
  const [renderedForLocationState, setRenderedForLocationState] = useState(location.state);
  if (renderedForLocationState !== location.state) {
    setRenderedForLocationState(location.state);
    const tabFromState = parseProductTabFromState(location.state);
    if (tabFromState) {
      setActiveTab(tabFromState);
    }
  }
  //#endregion

  //#region Functions
  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const resolvedId = stateProductId;

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
  }, [stateProductId, showToast]);

  const handleConfirmStatus = async (status: ProductStatus) => {
    if (!product || isReadOnly) return;
    try {
      const isActive = status !== "inactive";
      const productStatus =
        status === "active" ? 1 : status === "coming-soon" ? 2 : null;
      const payload: ProductInputPayload = {
        productId: product.productId,
        productName: product.productName,
        shortName: product.shortName,
        subCategoryName: product.subCategoryName,
        prodDescription: product.prodDescription,
        externalPageUrl: product.externalPageUrl,
        navigationTarget: product.navigationTarget,
        isActive,
        productStatus,
        contactUserId: product.contactUserId,
      };
      await updateProduct(payload);
      await loadProduct();
      showToast(
        `Product status changed to ${status.replace("-", " ")}.`,
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
    // Standard mount/dependency-driven data-fetch effect, preserved as-is per this review's own
    // instruction not to blindly rewrite working async loading effects. Known gap (tracked, not
    // fixed here): `loadProduct` doesn't check a cancellation flag internally, so in the rare
    // case this component unmounts while the request is still in flight, its setState calls
    // would still fire after unmount — a real but pre-existing, wider-reaching gap shared with
    // several other detail pages in this app, not something newly introduced or safe to silently
    // paper over here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProduct();
  }, [loadProduct]);
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
  const logoSrc = resolveProductLogoUrl(product.logoName, product.updatedDate, product.productId);
  const warnings = getProductWarnings(app, [app]);

  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={app.name}
        icon={<ProductIcon icon={logoSrc || ""} name={app.name} />}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CommonButton
              variant="headerSecondary"
              iconLeft={<ArrowLeft size={14} />}
              onClick={() => navigate(PRODUCTS_PATHS.list)}
            >
              Back to Products
            </CommonButton>
            {!isReadOnly && (
              <CommonButton
                variant="headerSecondary"
                iconLeft={<RefreshCw size={14} />}
                onClick={() => setChangingStatus(true)}
              >
                Change Status
              </CommonButton>
            )}
            <CommonButton
              variant="headerSecondary"
              iconLeft={<Pencil size={14} />}
              onClick={() =>
                navigate(PRODUCTS_PATHS.edit, {
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

      {isReadOnly ? <ReadOnlyBanner featureName="Products" /> : null}

      <Tabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "details", label: "Product Details" },
          { id: "customers", label: "Organizations" },
          { id: "license-details", label: "License Details" },
          { id: "license-history", label: "License History" },
          { id: "api-integration", label: "Api Integration" },
        ]}
      />

      <TabPanel id="details" activeId={activeTab}>
        <ProductDetailsTab app={app} />
      </TabPanel>

      <TabPanel id="customers" activeId={activeTab}>
        <CustomerDetails app={app} />
      </TabPanel>

      <TabPanel id="license-details" activeId={activeTab}>
        <LicenseDetails app={app} readOnly={isReadOnly} />
      </TabPanel>

      <TabPanel id="license-history" activeId={activeTab}>
        <LicenseHistory app={app} />
      </TabPanel>

      <TabPanel id="api-integration" activeId={activeTab}>
        <ApiIntegrationDetails app={app} />
      </TabPanel>

      <ProductStatusModal
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
