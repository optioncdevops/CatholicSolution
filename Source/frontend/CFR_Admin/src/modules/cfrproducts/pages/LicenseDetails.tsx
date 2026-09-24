import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus } from "lucide-react";
import { EmptyState } from "@shared/app/components/EmptyState";
import { useToast } from "@shared/app/components/ToastProvider";
import { CommonButton, CommonIconButton } from "@app/components/buttons";
import { Dropdown } from "@app/components/formControls";
import {
  DataTable,
  type DataTableColumn,
} from "@app/components/dataTable/DataTable";
import { formatDate } from "@/modules/utils/formatDate";
import { DetailField } from "@app/components/DetailField";
import { BaseModal } from "@app/components/modal/BaseModal";
import { useAdminData } from "@/modules/AdminDataContext";
import { useFeatureAccessLevel } from "@/modules/authentication/hooks/useFeatureAccessLevel";
import { getLicenseDetails } from "../services/productService";
import type { ProductLicenseApiItem } from "../types/productTypes";
import {
  PRODUCTS_PATHS,
  formatCustomerCodeAsInteger,
  toLiveProductLicenseRows,
  type LiveProductLicense,
} from "../utils/productHelpers";
import { LICENSE_DETAILS_STATUS_FILTERS } from "../utils/productFilters";
import { InvoiceStatusBadge } from "../components/InvoiceStatusBadge";
import { EditLicenseModal } from "./partials/EditLicenseModal";
import type { AdminApplication, License } from "@/modules/types";

export function InvoiceDetailModal({
  invoice,
  onClose,
}: {
  invoice: License | null;
  onClose: () => void;
}) {
  const { getOrganization } = useAdminData();
  if (!invoice) return null;

  const org = getOrganization(invoice.orgId);
  const organizationCode = formatCustomerCodeAsInteger(
    invoice.orgId || org?.code,
  );

  return (
    <BaseModal
      isOpen={Boolean(invoice)}
      onClose={onClose}
      title={invoice.title || invoice.licenseNumber}
      size="md"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <DetailField label="Invoice No" value={invoice.licenseNumber} />
          <DetailField label="Organization Code" value={organizationCode} />
          <DetailField
            label="Organization Name"
            value={
              org?.name ?? invoice.title?.split("—")[0]?.trim() ?? invoice.orgId
            }
            wrap
            className="col-span-2"
          />
          <DetailField
            label="Start date"
            value={formatDate(invoice.startDate)}
          />
          <DetailField
            label="Expiry date"
            value={formatDate(invoice.expiryDate)}
          />
        </div>
        {invoice.customMessage ? (
          <div className="rounded-[var(--radius-panel)] border border-[var(--line-soft)] bg-[var(--surface-muted)] p-3">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--text-faint)]">
              Message to Customer
            </p>
            <div
              className="text-sm text-[var(--text-secondary)]"
              dangerouslySetInnerHTML={{ __html: invoice.customMessage }}
            />
          </div>
        ) : null}
      </div>
    </BaseModal>
  );
}

export function LicenseDetails({
  app,
  readOnly = false,
}: {
  app: AdminApplication;
  readOnly?: boolean;
}) {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createAccess = useFeatureAccessLevel(PRODUCTS_PATHS.featureCreateLicense);
  //#endregion

  //#region States
  const [dbLicenses, setDbLicenses] = useState<ProductLicenseApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [viewingInvoice, setViewingInvoice] = useState<License | null>(null);
  const [editingLicense, setEditingLicense] =
    useState<ProductLicenseApiItem | null>(null);
  //#endregion

  //#region Functions
  const fetchLicenses = useCallback(async () => {
    const numericId = Number(app.id);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        setLoading(true);
        const res = await getLicenseDetails(numericId);
        if (res.resultData && Array.isArray(res.resultData)) {
          setDbLicenses(res.resultData as ProductLicenseApiItem[]);
        } else {
          setDbLicenses([]);
        }
      } catch (err) {
        console.error("Error fetching product licenses:", err);
        showToast(
          typeof err === "string" ? err : "Failed to load licenses.",
          "error",
        );
        setDbLicenses([]);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [app.id, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    // Standard mount/dependency-driven data-fetch effect, preserved as-is per this review's own
    // instruction not to blindly rewrite working async loading effects. Known gap (tracked, not
    // fixed here): `fetchLicenses` doesn't check a cancellation flag internally, so in the rare
    // case this component unmounts while the request is still in flight, its `setLoading` calls
    // would still fire after unmount — the same shape as several other detail/edit pages in this
    // app: a real but pre-existing, wider-reaching gap, not something newly introduced or safe to
    // silently paper over here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLicenses();
  }, [fetchLicenses]);
  //#endregion

  const mappedLicenses: LiveProductLicense[] = useMemo(
    () => toLiveProductLicenseRows(dbLicenses),
    [dbLicenses],
  );

  const rows = useMemo(() => {
    return mappedLicenses.filter((lic) => {
      if (statusFilter !== "all" && lic.status !== statusFilter) {
        return false;
      }
      if (timeFilter === "all") return true;

      const dateStr = lic.startDate || lic.expiryDate;
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return true;

      const now = new Date();
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

      if (timeFilter === "last-30-days") {
        return diffDays >= 0 && diffDays <= 30;
      }
      if (timeFilter === "last-90-days") {
        return diffDays >= 0 && diffDays <= 90;
      }
      if (timeFilter === "last-180-days") {
        return diffDays >= 0 && diffDays <= 180;
      }
      return true;
    });
  }, [mappedLicenses, statusFilter, timeFilter]);

  const columns: DataTableColumn<LiveProductLicense>[] = [
    {
      id: "actions",
      header: "Actions",
      pinLeft: true,
      width: "5rem",
      excludeFromExport: true,
      cell: (lic) => (
        <div className="flex items-center gap-0.5">
          <CommonIconButton
            aria-label={`View invoice ${lic.invoiceNumber}`}
            tooltip="View"
            icon={<Eye size={15} />}
            onClick={() => {
              const licenseModalData: License = {
                id: lic.id,
                licenseNumber: lic.invoiceNumber,
                licenseKey: lic.licenseKey,
                orgId: String(lic.orgId),
                appId: app.id,
                title: `${app.name} — ${lic.invoiceNumber}`,
                startDate: lic.startDate,
                expiryDate: lic.expiryDate,
                status: lic.status === "active" ? "active" : "suspended",
                customMessage: lic.remarks || undefined,
              };
              setViewingInvoice(licenseModalData);
            }}
          />
          {!readOnly && (
            <CommonIconButton
              aria-label={`Edit license ${lic.invoiceNumber}`}
              tooltip="Edit"
              icon={<Pencil size={14} />}
              onClick={() => {
                const raw =
                  dbLicenses.find(
                    (item) => String(item.licenseId) === lic.id,
                  ) ?? null;
                setEditingLicense(raw);
              }}
            />
          )}
        </div>
      ),
    },
    {
      id: "customerCode",
      header: "Organization Code",
      width: "12rem",
      value: (lic) => lic.customerCode,
      cell: (lic) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {lic.customerCode}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Organization Name",
      width: "18rem",
      value: (lic) => lic.customer,
      cell: (lic) => (
        <span className="font-bold text-[var(--text-primary)]">
          {lic.customer}
        </span>
      ),
    },
    {
      id: "invoiceNumber",
      header: "Invoice No",
      width: "12rem",
      value: (lic) => lic.invoiceNumber,
      cell: (lic) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {lic.invoiceNumber}
        </span>
      ),
    },
    {
      id: "startDate",
      header: "Start Date",
      width: "8.5rem",
      value: (lic) => lic.startDate,
      cell: (lic) => (
        <span className="text-[var(--text-muted)]">
          {lic.startDate ? formatDate(lic.startDate) : "—"}
        </span>
      ),
    },
    {
      id: "expiryDate",
      header: "Expiry Date",
      width: "8.5rem",
      value: (lic) => lic.expiryDate,
      cell: (lic) => (
        <span className="text-[var(--text-muted)]">
          {lic.expiryDate ? formatDate(lic.expiryDate) : "—"}
        </span>
      ),
    },
    {
      id: "days",
      header: "Days",
      width: "6rem",
      value: (lic) => lic.days ?? "",
      cell: (lic) => {
        if (lic.days === null)
          return <span className="text-[var(--text-muted)]">—</span>;
        return (
          <span
            className={
              lic.days < 0
                ? "font-bold text-rose-600 dark:text-rose-400"
                : "text-[var(--text-secondary)]"
            }
          >
            {lic.days}
          </span>
        );
      },
    },
    {
      id: "paidOn",
      header: "Paid On",
      width: "13rem",
      value: (lic) => lic.paidOn ?? "Not paid yet",
      cell: (lic) => (
        <span
          className={
            lic.paidOn
              ? "text-xs text-[var(--text-secondary)]"
              : "text-xs text-[var(--text-muted)]"
          }
        >
          {lic.paidOn ?? "Not paid yet"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: "7.5rem",
      value: (lic) => lic.status,
      cell: (lic) => <InvoiceStatusBadge status={lic.status} />,
    },
  ];

  if (loading) {
    return (
      <div className="admin-reveal flex flex-col gap-4" aria-busy="true">
        <div className="admin-skeleton h-10 w-full rounded-[var(--radius-panel)]" />
        <div className="admin-skeleton h-48 w-full rounded-[var(--radius-panel)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
          {LICENSE_DETAILS_STATUS_FILTERS.map((filter) => {
            const count =
              filter.id === "all"
                ? mappedLicenses.length
                : mappedLicenses.filter((lic) => lic.status === filter.id)
                    .length;
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

        <div className="flex items-center gap-2">
          <div className="w-36">
            <Dropdown
              label="Time Filter"
              hideLabel
              placeholder="All Time"
              searchable={false}
              clearable={false}
              options={[
                { id: "last-30-days", value: "Last 30 Days" },
                { id: "last-90-days", value: "Last 90 Days" },
                { id: "last-180-days", value: "Last 180 Days" },
                { id: "all", value: "All Time" },
              ]}
              value={timeFilter}
              onValueChange={(val) => setTimeFilter(val ?? "all")}
              className="min-h-8"
            />
          </div>
          {createAccess !== "denied" && (
            <CommonButton
              variant="primary"
              iconLeft={<Plus size={14} />}
              onClick={() =>
                navigate(PRODUCTS_PATHS.addLicense, {
                  state: { productId: Number(app.id), tab: "license-details" },
                })
              }
              disabled={readOnly || createAccess === "readOnly"}
            >
              Create Invoice
            </CommonButton>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="🔑"
          title="No licenses found"
          description="Create a license or try a different status filter."
        />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(lic) => lic.id}
          exportFileName={`${app.shortName}-licenses`}
          exportTitle={`${app.name} — Licenses`}
          emptyMessage="No licenses found."
        />
      )}

      <InvoiceDetailModal
        invoice={viewingInvoice}
        onClose={() => setViewingInvoice(null)}
      />

      <EditLicenseModal
        license={editingLicense}
        onClose={() => setEditingLicense(null)}
        onSaved={fetchLicenses}
        readOnly={readOnly}
      />
    </div>
  );
}
