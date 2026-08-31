export interface RightsNode {
  id: string;
  label: string;
  description?: string;
  children?: RightsNode[];
}

/** Module → Feature → Activity — the industry-standard three-tier shape for a permission
 * matrix (e.g. Products > Product List > Export). Only leaf Activity nodes carry a real,
 * settable permission; Module and Feature rows are pure grouping with a rolled-up summary
 * and a bulk "apply to all" action in the UI. */
export const RIGHTS_TREE: RightsNode[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    children: [
      {
        id: 'dashboard.kpis', label: 'KPI Tiles', description: 'Product, organization, user and request counts.',
        children: [
          { id: 'dashboard.kpis.view', label: 'View' },
        ],
      },
      {
        id: 'dashboard.distribution', label: 'Distribution Charts', description: 'Organizations by plan, requests by status.',
        children: [
          { id: 'dashboard.distribution.view', label: 'View' },
        ],
      },
      {
        id: 'dashboard.attention', label: 'Needs Attention', description: 'Pending access requests list.',
        children: [
          { id: 'dashboard.attention.view', label: 'View' },
        ],
      },
    ],
  },
  {
    id: 'products', label: 'Products',
    children: [
      {
        id: 'products.list', label: 'Product List & Filters', description: 'Search, filter and sort the product catalog.',
        children: [
          { id: 'products.list.view', label: 'View' },
          { id: 'products.list.export', label: 'Export' },
        ],
      },
      {
        id: 'products.detail', label: 'Product Detail', description: 'View a single product\'s full profile and customers.',
        children: [
          { id: 'products.detail.view', label: 'View' },
        ],
      },
      {
        id: 'products.edit', label: 'Edit Product', description: 'Change editable product metadata.',
        children: [
          { id: 'products.edit.view', label: 'View' },
          { id: 'products.edit.edit', label: 'Edit' },
        ],
      },
      {
        id: 'products.status', label: 'Change Product Status', description: 'Move a product between lifecycle statuses.',
        children: [
          { id: 'products.status.change', label: 'Change Status' },
        ],
      },
      {
        id: 'products.invoices', label: 'Licenses', description: 'Create and review licenses for a product\'s customers.',
        children: [
          { id: 'products.invoices.view', label: 'View' },
          { id: 'products.invoices.create', label: 'Create' },
        ],
      },
    ],
  },
  {
    id: 'organizations', label: 'Organizations',
    children: [
      {
        id: 'organizations.list', label: 'Organization List', description: 'Search and filter organizations.',
        children: [
          { id: 'organizations.list.view', label: 'View' },
          { id: 'organizations.list.export', label: 'Export' },
        ],
      },
      {
        id: 'organizations.detail', label: 'Organization Detail', description: 'View profile, users, products and requests.',
        children: [
          { id: 'organizations.detail.view', label: 'View' },
        ],
      },
      {
        id: 'organizations.products', label: 'Assign / Remove Products', description: 'Manage which products an organization can access.',
        children: [
          { id: 'organizations.products.assign', label: 'Assign' },
          { id: 'organizations.products.remove', label: 'Remove' },
        ],
      },
    ],
  },
  {
    id: 'users', label: 'Users',
    children: [
      {
        id: 'users.list', label: 'User List', description: 'Search and filter users.',
        children: [
          { id: 'users.list.view', label: 'View' },
          { id: 'users.list.export', label: 'Export' },
        ],
      },
      {
        id: 'users.detail', label: 'User Detail', description: 'View a user\'s profile and application access.',
        children: [
          { id: 'users.detail.view', label: 'View' },
        ],
      },
      {
        id: 'users.status', label: 'Change User Status', description: 'Activate or deactivate a user.',
        children: [
          { id: 'users.status.change', label: 'Change Status' },
        ],
      },
      {
        id: 'users.access', label: 'Grant / Revoke Access', description: 'Manage a user\'s product access.',
        children: [
          { id: 'users.access.grant', label: 'Grant' },
          { id: 'users.access.revoke', label: 'Revoke' },
        ],
      },
    ],
  },
  {
    id: 'requests', label: 'Requests',
    children: [
      {
        id: 'requests.inbox', label: 'Requests Inbox', description: 'View incoming access requests.',
        children: [
          { id: 'requests.inbox.view', label: 'View' },
        ],
      },
      {
        id: 'requests.resolve', label: 'Resolve Requests', description: 'Approve, reject, or request more information.',
        children: [
          { id: 'requests.resolve.approve', label: 'Approve' },
          { id: 'requests.resolve.reject', label: 'Reject' },
          { id: 'requests.resolve.info', label: 'Request Info' },
        ],
      },
    ],
  },
  {
    id: 'administration', label: 'Administration',
    children: [
      {
        id: 'administration.roles', label: 'User Roles', description: 'The role catalog assigned to admin users.',
        children: [
          { id: 'administration.roles.view', label: 'View' },
          { id: 'administration.roles.create', label: 'Create' },
          { id: 'administration.roles.edit', label: 'Edit' },
          { id: 'administration.roles.delete', label: 'Delete' },
        ],
      },
      {
        id: 'administration.rights', label: 'Rights', description: 'The permission matrix itself, per role.',
        children: [
          { id: 'administration.rights.view', label: 'View' },
          { id: 'administration.rights.manage', label: 'Manage' },
        ],
      },
      {
        id: 'administration.templates', label: 'Email Templates', description: 'Transactional email subject and body content.',
        children: [
          { id: 'administration.templates.view', label: 'View' },
          { id: 'administration.templates.edit', label: 'Edit' },
        ],
      },
    ],
  },
];

/** Every node id in the tree, used for "expand all" and default-permission seeding. */
export function collectNodeIds(nodes: RightsNode[]): string[] {
  return nodes.flatMap((node) => [node.id, ...(node.children ? collectNodeIds(node.children) : [])]);
}

export const ALL_RIGHTS_NODE_IDS = collectNodeIds(RIGHTS_TREE);

/** Leaf (Activity) node ids under a node — these are the only ones with a real permission. */
export function collectLeafIds(node: RightsNode): string[] {
  if (!node.children?.length) return [node.id];
  return node.children.flatMap(collectLeafIds);
}

/** Total number of leaf (Activity) nodes in the whole tree — used for the summary strip. */
export const TOTAL_ACTIVITY_COUNT = RIGHTS_TREE.flatMap(collectLeafIds).length;
