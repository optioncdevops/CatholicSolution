import { Badge } from '@app/components/Badge';

/**
 * Status badge for Invoices in Invoice Details and Invoice History tabs.
 */
export function InvoiceStatusBadge({ status }: { status: string }) {
  if (status === 'paid') {
    return <Badge tone="success">Paid</Badge>;
  }
  if (status === 'unpaid') {
    return <Badge tone="warning">Unpaid</Badge>;
  }
  if (status === 'overdue') {
    return <Badge tone="danger">Overdue</Badge>;
  }
  if (status === 'expiring-soon') {
    return <Badge tone="warning">Expiring Soon</Badge>;
  }
  if (status === 'suspended') {
    return <Badge tone="danger">Suspended</Badge>;
  }
  return <Badge tone="neutral">{status}</Badge>;
}
