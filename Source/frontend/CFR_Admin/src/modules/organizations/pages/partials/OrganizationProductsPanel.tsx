import { useState } from 'react';
import { Plus, Power, PowerOff } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '@/modules/lib/confirm';
import { formatDate } from '@/modules/utils/formatDate';
import { assignOrganizationProduct, removeOrganizationProduct } from '../../services/organizationsService';
import type { OrganizationProductApiItem } from '../../types/organizationTypes';
import AssignOrganizationProductModal from './AssignOrganizationProductModal';

type OrganizationProductsPanelProps = {
  orgId: number;
  orgName: string;
  products: OrganizationProductApiItem[];
  onChanged: () => Promise<void> | void;
};

// Activate/Deactivate reuse the existing AssignOrganizationProduct / RemoveOrganizationProduct
// endpoints as-is — the backend already treats "remove" as a soft-delete (AssignStatus set to
// 'inactive', row kept for history) and "assign" as an insert-or-reactivate, so no new mapping
// system or stored procedure action is needed for this activate/deactivate toggle.
const OrganizationProductsPanel = ({ orgId, orgName, products, onChanged }: OrganizationProductsPanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [processingProductId, setProcessingProductId] = useState<number | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  //#endregion

  //#region Handlers
  const handleDeactivate = async (product: OrganizationProductApiItem) => {
    const confirmed = await confirmAction({
      title: 'Deactivate this app?',
      description: `${orgName} and its members will lose access to ${product.productName}.`,
      confirmLabel: 'Deactivate',
      tone: 'danger',
    });
    if (!confirmed) return;

    setProcessingProductId(product.productId);
    try {
      await removeOrganizationProduct(orgId, product.productId);
      showToast(`${product.productName} deactivated for ${orgName}.`, 'success');
      await onChanged();
    } catch (error) {
      console.error('Error deactivating product:', error);
      showToast(typeof error === 'string' ? error : 'Failed to update application access.', 'error');
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleActivate = async (product: OrganizationProductApiItem) => {
    setProcessingProductId(product.productId);
    try {
      await assignOrganizationProduct({ orgId, productId: product.productId });
      showToast(`${product.productName} activated for ${orgName}.`, 'success');
      await onChanged();
    } catch (error) {
      console.error('Error activating product:', error);
      showToast(typeof error === 'string' ? error : 'Failed to update application access.', 'error');
    } finally {
      setProcessingProductId(null);
    }
  };
  //#endregion

  //#region Columns
  const columns: DataTableColumn<OrganizationProductApiItem>[] = [
    {
      id: 'productName', header: 'App', width: '14rem',
      value: (product) => product.productName,
      cell: (product) => <span className="font-bold text-[var(--text-primary)]">{product.productName}</span>,
    },
    {
      id: 'subCategoryName', header: 'Category',
      value: (product) => product.subCategoryName ?? '',
      cell: (product) => <span className="text-[var(--text-secondary)]">{product.subCategoryName || '—'}</span>,
    },
    {
      id: 'assignStatus', header: 'Access',
      value: (product) => product.assignStatus ?? '',
      cell: (product) => <StatusBadge status={product.assignStatus === 'active' ? 'active' : 'inactive'} kind="application" />,
    },
    {
      id: 'assignedDate', header: 'Last Changed',
      value: (product) => product.assignedDate,
      cell: (product) => <span className="text-[var(--text-muted)]">{formatDate(product.assignedDate)}</span>,
    },
    {
      id: 'expiryDate', header: 'Expiry Date',
      value: (product) => product.expiryDate ?? '',
      cell: (product) => <span className="text-[var(--text-muted)]">{product.expiryDate ? formatDate(product.expiryDate) : 'No expiry'}</span>,
    },
    {
      id: 'actions', header: 'Actions', width: '4rem', excludeFromExport: true, sortable: false,
      cell: (product) => (product.assignStatus === 'active' ? (
        <CommonIconButton
          aria-label={`Deactivate ${product.productName}`}
          tooltip="Deactivate"
          variant="danger"
          icon={<PowerOff size={14} />}
          onClick={() => handleDeactivate(product)}
          disabled={processingProductId === product.productId}
        />
      ) : (
        <CommonIconButton
          aria-label={`Activate ${product.productName}`}
          tooltip="Activate"
          variant="success"
          icon={<Power size={14} />}
          onClick={() => handleActivate(product)}
          disabled={processingProductId === product.productId}
        />
      )),
    },
  ];
  //#endregion

  //#region Render
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <CommonButton size="sm" iconLeft={<Plus size={14} />} onClick={() => setAssignModalOpen(true)}>
          Assign App
        </CommonButton>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="📦" title="No apps assigned" description="Apps assigned to this organization will appear here." />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          getRowId={(product) => String(product.productId)}
          exportFileName="organization-products"
          exportTitle="Organization — Apps"
          emptyMessage="No apps found."
        />
      )}

      <AssignOrganizationProductModal
        isOpen={assignModalOpen}
        orgId={orgId}
        orgName={orgName}
        onClose={() => setAssignModalOpen(false)}
        onAssigned={onChanged}
      />
    </div>
  );
  //#endregion
};

export default OrganizationProductsPanel;
