import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@shared/app/components/ToastProvider';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { getProductApiIntegrations } from '../services/productService';
import type { ProductApiIntegrationRow } from '../types/productTypes';
import { normalizeProductApiIntegrationList, toProductApiIntegrationRow } from '../utils/productHelpers';
import type { AdminApplication } from '@/modules/types';
import { CommonIconButton } from '@app/components/buttons';
import { Pencil } from 'lucide-react';
import { EditApiIntegrationModal } from './partials/EditApiIntegrationModal';

export function ApiIntegrationDetails({ app, readOnly }: { app: AdminApplication; readOnly?: boolean; }) {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [rows, setRows] = useState<ProductApiIntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIntegration, setEditingIntegration] = useState<ProductApiIntegrationRow | null>(null);
  //#endregion

  //#region Functions
  const loadApiIntegrations = useCallback(async (signal: AbortSignal) => {
    const productId = Number(app.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getProductApiIntegrations(productId, signal);
      if (signal.aborted) {
        return;
      }
      const items = normalizeProductApiIntegrationList(res.resultData).map(toProductApiIntegrationRow);
      setRows(items);
    } catch (err) {
      if (signal.aborted) {
        return;
      }
      console.error('Error fetching product API integrations:', err);
      showToast(typeof err === 'string' ? err : 'Failed to load API integrations.', 'error');
      setRows([]);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [app.id, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    const controller = new AbortController();
    void loadApiIntegrations(controller.signal);
    return () => controller.abort();
  }, [loadApiIntegrations]);
  //#endregion

  const columns: DataTableColumn<ProductApiIntegrationRow>[] = [
    {
      id: 'edit_action',
      header: 'Actions',
      pinLeft: true,
      width: '4rem',
      excludeFromExport: true,
      cell: (row) => (
        <div className="flex items-center gap-0.5">
          {!readOnly && (
            <CommonIconButton
              aria-label={`Edit ${row.site} integration`}
              tooltip="Edit"
              icon={<Pencil size={14} />}
              onClick={() => setEditingIntegration(row)}
            />
          )}
        </div>
      ),
    },
    { id: 'site', header: 'Site', width: '10rem', value: (row) => row.site, cell: (row) => <span className="font-bold text-[var(--text-primary)]">{row.site}</span> },
    {
      id: 'siteUrl',
      header: 'Site Url',
      width: '18rem',
      value: (row) => row.siteUrl,
      cell: (row) => row.siteUrl === '—'
        ? <span className="text-[var(--text-muted)]">{row.siteUrl}</span>
        : (
          <a
            href={row.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-[var(--primary)] hover:underline"
            title={row.siteUrl}
          >
            {row.siteUrl}
          </a>
        ),
    },
    { id: 'siteDescription', header: 'Site Description', value: (row) => row.siteDescription, cell: (row) => <span className="text-[var(--text-secondary)]">{row.siteDescription}</span> },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="admin-skeleton h-80 w-full rounded-[var(--radius-panel)]" />
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        exportFileName={`${app.shortName}-api-integration`}
        exportTitle={`${app.name} — Api Integration`}
        emptyMessage="No API integration configured for this environment."
      />

      <EditApiIntegrationModal
        integration={editingIntegration}
        onClose={() => setEditingIntegration(null)}
        onSaved={() => {
          const controller = new AbortController();
          void loadApiIntegrations(controller.signal);
        }}
        readOnly={readOnly}
      />
    </>
  );
}
