import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { EmptyState } from '@shared/app/components/EmptyState';
import { useToast } from '@shared/app/components/ToastProvider';
import { CommonButton, CommonIconButton } from '@app/components/buttons';
import { Dropdown } from '@app/components/formControls';
import { Badge } from '@app/components/Badge';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { confirmAction } from '@/modules/lib/confirm';
import { formatDate } from '@/modules/utils/formatDate';
import {
  assignOrganizationProduct,
  getAssignableOrganizationProducts,
  removeOrganizationProduct,
} from '../../services/organizationsService';
import type { AssignableProductApiItem, OrganizationProductApiItem } from '../../types/organizationTypes';

type OrganizationProductsPanelProps = {
  orgId: number;
  orgName: string;
  products: OrganizationProductApiItem[];
  onChanged: () => Promise<void> | void;
};

const OrganizationProductsPanel = ({ orgId, orgName, products, onChanged }: OrganizationProductsPanelProps) => {
  //#region Hooks
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [assignableProducts, setAssignableProducts] = useState<AssignableProductApiItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [removingProductId, setRemovingProductId] = useState<number | null>(null);
  //#endregion

  //#region Effects
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resultData, statusCode } = await getAssignableOrganizationProducts(orgId);
        if (cancelled) return;
        setAssignableProducts(statusCode === 204 || !Array.isArray(resultData) ? [] : resultData as AssignableProductApiItem[]);
      } catch (error) {
        if (cancelled) return;
        console.error('Error loading assignable products:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, products]);
  //#endregion

  //#region Handlers
  const handleAssign = async () => {
    if (!selectedProductId) return;
    const product = assignableProducts.find((item) => String(item.productId) === selectedProductId);
    setAssigning(true);
    try {
      await assignOrganizationProduct({ orgId, productId: Number(selectedProductId) });
      showToast(`${product?.productName ?? 'Product'} assigned to ${orgName}.`, 'success');
      setSelectedProductId('');
      await onChanged();
    } catch (error) {
      console.error('Error assigning product:', error);
      showToast(typeof error === 'string' ? error : 'Failed to assign product.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (product: OrganizationProductApiItem) => {
    const confirmed = await confirmAction({
      title: 'Remove this product?',
      description: `${orgName} will lose access to ${product.productName}.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!confirmed) return;

    setRemovingProductId(product.productId);
    try {
      await removeOrganizationProduct(orgId, product.productId);
      showToast(`${product.productName} removed from ${orgName}.`, 'success');
      await onChanged();
    } catch (error) {
      console.error('Error removing product:', error);
      showToast(typeof error === 'string' ? error : 'Failed to remove product.', 'error');
    } finally {
      setRemovingProductId(null);
    }
  };
  //#endregion

  //#region Columns
  const columns: DataTableColumn<OrganizationProductApiItem>[] = [
    {
      id: 'productName', header: 'Product', width: '14rem',
      value: (product) => product.productName,
      cell: (product) => <span className="font-bold text-[var(--text-primary)]">{product.productName}</span>,
    },
    {
      id: 'subCategoryName', header: 'Category',
      value: (product) => product.subCategoryName ?? '',
      cell: (product) => <span className="text-[var(--text-secondary)]">{product.subCategoryName || '—'}</span>,
    },
    {
      id: 'assignStatus', header: 'Status',
      value: (product) => product.assignStatus ?? '',
      cell: (product) => <Badge tone={product.assignStatus === 'active' ? 'success' : 'neutral'}>{product.assignStatus || '—'}</Badge>,
    },
    {
      id: 'assignedDate', header: 'Assigned On',
      value: (product) => product.assignedDate,
      cell: (product) => <span className="text-[var(--text-muted)]">{formatDate(product.assignedDate)}</span>,
    },
    {
      id: 'actions', header: 'Actions', width: '4rem', excludeFromExport: true, sortable: false,
      cell: (product) => (
        <CommonIconButton
          aria-label={`Remove ${product.productName}`}
          tooltip="Remove"
          variant="danger"
          icon={<Trash2 size={14} />}
          onClick={() => handleRemove(product)}
          disabled={removingProductId === product.productId}
        />
      ),
    },
  ];
  //#endregion

  //#region Render
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-64 shrink-0">
          <Dropdown
            label="Product to assign"
            hideLabel
            searchable={false}
            clearable={false}
            value={selectedProductId || undefined}
            onValueChange={(value) => setSelectedProductId(value ?? '')}
            options={assignableProducts.map((product) => ({ id: String(product.productId), value: product.productName }))}
            placeholder={assignableProducts.length === 0 ? 'All products assigned' : 'Select a product to assign…'}
            disabled={assigning || assignableProducts.length === 0}
            className="min-h-8"
          />
        </div>
        <CommonButton variant="primary" size="sm" iconLeft={<Plus size={14} />} onClick={handleAssign} loading={assigning} disabled={!selectedProductId || assigning}>Assign</CommonButton>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="📦" title="No products assigned" description="Assign a product above to give this organization access." />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          getRowId={(product) => String(product.productId)}
          exportFileName="organization-products"
          exportTitle="Organization — Products"
          emptyMessage="No products found."
        />
      )}
    </div>
  );
  //#endregion
};

export default OrganizationProductsPanel;
