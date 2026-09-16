import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PanelHeader } from '@shared/app/components/PanelHeader';
import { useToast } from '@shared/app/components/ToastProvider';
import { EmptyState } from '@shared/app/components/EmptyState';
import { CommonButton } from '@app/components/buttons';
import { StatusBadge } from '@app/components/Badge';
import { EntityAvatar } from '@app/components/EntityAvatar';
import { DataTable, type DataTableColumn } from '@app/components/dataTable/DataTable';
import { formatDate } from '@/modules/utils/formatDate';
import { getOrganizationUserDetail } from '../services/organizationsService';
import type { OrganizationUserAppApiItem, OrganizationUserDetailApiItem } from '../types/organizationTypes';

const appColumns: DataTableColumn<OrganizationUserAppApiItem>[] = [
  {
    id: 'productName', header: 'App',
    value: (app) => app.productName,
    cell: (app) => <span className="font-bold text-[var(--text-primary)]">{app.productName}</span>,
  },
  {
    id: 'subCategoryName', header: 'Category',
    value: (app) => app.subCategoryName ?? '',
    cell: (app) => <span className="text-[var(--text-secondary)]">{app.subCategoryName || '—'}</span>,
  },
];

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.625rem] font-bold uppercase tracking-wide text-[var(--text-faint)]">{label}</p>
      <div className="mt-1 text-[0.8125rem] font-bold text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

const OrganizationMemberDetailPage = () => {
  //#region Hooks
  const { orgId, authUserId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  //#endregion

  //#region States
  const [member, setMember] = useState<OrganizationUserDetailApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  //#endregion

  const numericOrgId = Number(orgId);
  const numericAuthUserId = Number(authUserId);

  //#region Functions
  const loadMember = useCallback(async () => {
    if (!numericOrgId || numericOrgId <= 0 || !numericAuthUserId || numericAuthUserId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { resultData, statusCode } = await getOrganizationUserDetail(numericOrgId, numericAuthUserId);
      if (statusCode === 204 || !resultData) {
        setNotFound(true);
        return;
      }
      setMember(resultData as OrganizationUserDetailApiItem);
    } catch (error) {
      console.error('Error loading organization member:', error);
      showToast('Failed to load user detail.', 'error');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [numericOrgId, numericAuthUserId, showToast]);
  //#endregion

  //#region Effects
  useEffect(() => {
    // Standard mount/dependency-driven data-fetch effect, preserved as-is per this review's own
    // instruction not to blindly rewrite working async loading effects. Known gap (tracked, not
    // fixed here): `loadMember` doesn't check a cancellation flag internally, so in the rare case
    // this component unmounts while the request is still in flight, its state-setting calls would
    // still fire after unmount — the same shape as several other detail/edit pages in this app: a
    // real but pre-existing, wider-reaching gap, not something newly introduced or safe to
    // silently paper over here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMember();
  }, [loadMember]);
  //#endregion

  if (notFound) return <Navigate to={`/admin/organizations/${orgId ?? ''}`} replace />;

  const displayName = member ? (member.fullName || member.email) : '';

  //#region Render
  return (
    <div className="admin-reveal flex flex-col gap-4">
      <PanelHeader
        title={displayName || 'Member'}
        icon={displayName ? <EntityAvatar name={displayName} size={36} /> : undefined}
        action={(
          <CommonButton variant="headerSecondary" size="sm" iconLeft={<ArrowLeft size={14} />} onClick={() => navigate(`/admin/organizations/${orgId}`)}>
            Back to {member?.orgName ?? 'Organization'}
          </CommonButton>
        )}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-busy="true" aria-label="Loading member">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="admin-skeleton h-16 w-full rounded-[var(--radius-panel)]" />)}
        </div>
      ) : member ? (
        <>
          <section className="admin-panel-card">
            <div className="admin-panel-card__header"><h2 className="panel-title">Profile</h2></div>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
              <DetailField label="Full Name">{member.fullName || '—'}</DetailField>
              <DetailField label="Email">{member.email || '—'}</DetailField>
              <DetailField label="Role">{member.roleName || '—'}</DetailField>
              <DetailField label="Last Login">
                <span className="font-normal text-[var(--text-faint)]" title="This platform does not yet track member sign-in timestamps.">Not tracked</span>
              </DetailField>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__header"><h2 className="panel-title">Organization Membership</h2></div>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
              <DetailField label="Organization">{member.orgName}</DetailField>
              <DetailField label="Membership Status">
                <StatusBadge status={member.memberStatus || 'inactive'} kind="user" />
              </DetailField>
              <DetailField label="Linked On">{formatDate(member.linkedDate)}</DetailField>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-card__header"><h2 className="panel-title">Effective Application Access</h2></div>
            <p className="px-4 pt-3 text-sm text-[var(--text-muted)]">
              An app appears here only when {member.orgName} currently has it active AND this member has an individual assignment for it — organization-level deactivation immediately removes an app from this list and from the member's CFR portal Your Apps.
            </p>
            <div className="p-4">
              {member.apps.length === 0 ? (
                <EmptyState icon="📦" title="No effective app access" description="Apps this member can launch will appear here." />
              ) : (
                <DataTable
                  data={member.apps}
                  columns={appColumns}
                  getRowId={(app) => String(app.productId)}
                  exportFileName="member-app-access"
                  exportTitle={`${displayName} — Effective App Access`}
                  emptyMessage="No apps found."
                />
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
  //#endregion
};

export default OrganizationMemberDetailPage;
