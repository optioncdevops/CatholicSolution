import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { EmptyState } from "@shared/app/components/EmptyState";
import { useToast } from "@shared/app/components/ToastProvider";
import { CommonButton, CommonIconButton } from "@app/components/buttons";
import { StatusBadge } from "@app/components/Badge";
import {
  DataTable,
  type DataTableColumn,
} from "@app/components/dataTable/DataTable";
import {
  formatDate,
  formatDaysLabel,
  effectiveLicenseStatus,
} from "@/modules/utils/formatDate";
import { DetailField } from "@app/components/DetailField";
import { BaseModal } from "@app/components/modal/BaseModal";
import { useAdminData } from "@/modules/AdminDataContext";
import { getLicenseDetails } from "../services/productService";
import type { ProductLicenseApiItem } from "../types/productTypes";
import {
  PRODUCTS_PATHS,
  formatCustomerCodeNumeric,
  isLicenseUpcoming,
  toLicenseDetailsRows,
} from "../utils/productHelpers";
import { LICENSE_DETAILS_STATUS_FILTERS } from "../utils/productFilters";
import type {
  AdminApplication,
  EffectiveLicenseStatus,
  License,
} from "@/modules/types";

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
  const status = effectiveLicenseStatus(invoice.status, invoice.expiryDate);
  const customerCode = formatCustomerCodeNumeric(org?.code || invoice.orgId);

  return (
    <BaseModal
      isOpen={Boolean(invoice)}
      onClose={onClose}
      title={invoice.title || invoice.licenseNumber}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {org?.name ? (
          <p className="-mt-2 text-xs text-[var(--text-muted)]">{org.name}</p>
        ) : null}
        <div className="flex items-center gap-2">
          <StatusBadge status={status} kind="license" />
          {status !== "suspended" && status !== "expired" ? (
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {formatDaysLabel(invoice.expiryDate)}
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DetailField
            label="Customer"
            value={
              org?.name ?? invoice.title?.split("—")[0]?.trim() ?? invoice.orgId
            }
          />
          <DetailField label="Customer code" value={customerCode} />
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

export interface LiveProductLicense {
  id: string;
  licenseId: number;
  organizationProductId: number;
  orgId: number;
  customerCode: string;
  customer: string;
  licenseNumber: string;
  licenseKey: string;
  licenseType: string;
  startDate: string;
  expiryDate: string;
  status: EffectiveLicenseStatus;
  rawStatus: string;
  assignStatus?: string | null;
  remarks?: string | null;
}

export function LicenseDetails({ app }: { app: AdminApplication }) {
  //#region Hooks
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [dbLicenses, setDbLicenses] = useState<ProductLicenseApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    EffectiveLicenseStatus | "all"
  >("all");
  const [viewingInvoice, setViewingInvoice] = useState<License | null>(null);
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
    void fetchLicenses();
  }, [fetchLicenses]);
  //#endregion

  const mappedLicenses: LiveProductLicense[] = useMemo(() => {
    return toLicenseDetailsRows(dbLicenses).map((lic) => {
      const effective = isLicenseUpcoming(lic)
        ? "active"
        : effectiveLicenseStatus("active", lic.expiryDate || "");
      return {
        id: String(lic.licenseId),
        licenseId: lic.licenseId,
        organizationProductId: lic.organizationProductId,
        orgId: lic.orgId,
        customerCode: formatCustomerCodeNumeric(lic.orgId),
        customer: lic.orgName || `Organization #${lic.orgId}`,
        licenseNumber: `LIC-${String(lic.licenseId).padStart(5, "0")}`,
        licenseKey: `LIC-${lic.orgId}-${lic.productId}-${String(lic.licenseId).padStart(4, "0")}`,
        licenseType: lic.licenseType ? (lic.licenseType.charAt(0).toUpperCase() + lic.licenseType.slice(1)) : "Subscription",
        startDate: lic.activationDate || "",
        expiryDate: lic.expiryDate || "",
        status:
          effective === "expired" || effective === "suspended"
            ? "active"
            : effective,
        rawStatus: lic.licenseStatus,
        assignStatus: lic.assignStatus,
        remarks: lic.remarks,
      };
    });
  }, [dbLicenses]);

  const rows = useMemo(() => {
    return mappedLicenses.filter(
      (lic) => statusFilter === "all" || lic.status === statusFilter,
    );
  }, [mappedLicenses, statusFilter]);

  const columns: DataTableColumn<LiveProductLicense>[] = [
    {
      id: "actions",
      header: "Actions",
      pinLeft: true,
      width: "4rem",
      excludeFromExport: true,
      cell: (lic) => (
        <CommonIconButton
          aria-label={`View license ${lic.licenseNumber}`}
          tooltip="View"
          icon={<Eye size={15} />}
          onClick={() => {
            const licenseModalData: License = {
              id: lic.id,
              licenseNumber: lic.licenseNumber,
              licenseKey: lic.licenseKey,
              orgId: String(lic.orgId),
              appId: app.id,
              title: `${app.name} — ${lic.licenseType ? (lic.licenseType.charAt(0).toUpperCase() + lic.licenseType.slice(1)) : 'Subscription'}`,
              startDate: lic.startDate,
              expiryDate: lic.expiryDate,
              status: lic.status === "active" ? "active" : "suspended",
              customMessage: lic.remarks || undefined,
            };
            setViewingInvoice(licenseModalData);
          }}
        />
      ),
    },
    {
      id: "customerCode",
      header: "Customer Code",
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
      header: "Customer",
      width: "18rem",
      value: (lic) => lic.customer,
      cell: (lic) => (
        <span className="font-bold text-[var(--text-primary)]">
          {lic.customer}
        </span>
      ),
    },
    {
      id: "licenseType",
      header: "License Type",
      width: "9.5rem",
      value: (lic) => lic.licenseType,
      cell: (lic) => (
        <span className="capitalize text-xs font-semibold text-[var(--text-secondary)]">
          {lic.licenseType}
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
      id: "status",
      header: "Status",
      width: "7.5rem",
      value: (lic) => lic.status,
      cell: (lic) => <StatusBadge status={lic.status} kind="license" />,
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          {rows.length} license{rows.length === 1 ? "" : "s"}
        </p>
        <CommonButton
          variant="primary"
          iconLeft={<Plus size={14} />}
          onClick={() =>
            navigate(PRODUCTS_PATHS.addLicense, {
              state: { productId: Number(app.id), tab: "invoice-details" },
            })
          }
        >
          Create License
        </CommonButton>
      </div>

      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
        {LICENSE_DETAILS_STATUS_FILTERS.map((filter) => {
          const count =
            filter.id === "all"
              ? mappedLicenses.length
              : mappedLicenses.filter((lic) => lic.status === filter.id).length;
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
    </div>
  );
}
