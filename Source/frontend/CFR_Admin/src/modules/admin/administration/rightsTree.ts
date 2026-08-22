export interface RightsNode {
  id: string;
  label: string;
  description?: string;
  children?: RightsNode[];
}

export const RIGHTS_TREE: RightsNode[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    children: [
      { id: 'dashboard.kpis', label: 'KPI tiles', description: 'Product, organization, user and request counts.' },
      { id: 'dashboard.distribution', label: 'Distribution charts', description: 'Organizations by plan, requests by status.' },
      { id: 'dashboard.attention', label: 'Needs attention', description: 'Pending access requests list.' },
    ],
  },
  {
    id: 'products', label: 'Products',
    children: [
      { id: 'products.list', label: 'Product list & filters', description: 'Search, filter and sort the product catalog.' },
      { id: 'products.detail', label: 'Product detail', description: 'View a single product\'s full profile and customers.' },
      { id: 'products.edit', label: 'Edit product', description: 'Change editable product metadata.' },
      { id: 'products.status', label: 'Change product status', description: 'Move a product between lifecycle statuses.' },
    ],
  },
  {
    id: 'organizations', label: 'Organizations',
    children: [
      { id: 'organizations.list', label: 'Organization list', description: 'Search and filter organizations.' },
      { id: 'organizations.detail', label: 'Organization detail', description: 'View profile, users, products and requests.' },
      { id: 'organizations.products', label: 'Assign / remove products', description: 'Manage which products an organization can access.' },
    ],
  },
  {
    id: 'users', label: 'Users',
    children: [
      { id: 'users.list', label: 'User list', description: 'Search and filter users.' },
      { id: 'users.detail', label: 'User detail', description: 'View a user\'s profile and application access.' },
      { id: 'users.status', label: 'Change user status', description: 'Activate or deactivate a user.' },
      { id: 'users.access', label: 'Grant / revoke access', description: 'Manage a user\'s product access.' },
    ],
  },
  {
    id: 'requests', label: 'Requests',
    children: [
      { id: 'requests.inbox', label: 'Requests inbox', description: 'View incoming access requests.' },
      { id: 'requests.resolve', label: 'Approve / reject / request info', description: 'Resolve a pending access request.' },
    ],
  },
  {
    id: 'administration', label: 'Administration',
    children: [
      {
        id: 'administration.roles', label: 'User roles',
        children: [
          { id: 'administration.roles.view', label: 'View roles', description: 'See the role catalog.' },
          { id: 'administration.roles.manage', label: 'Manage roles', description: 'Add, edit, duplicate or delete roles.' },
        ],
      },
      {
        id: 'administration.rights', label: 'Rights',
        children: [
          { id: 'administration.rights.view', label: 'View permission grid', description: 'See permissions per role and module.' },
          { id: 'administration.rights.manage', label: 'Manage permissions', description: 'Change ReadOnly / FullControl / Deny per feature.' },
        ],
      },
      {
        id: 'administration.settings', label: 'Settings',
        children: [
          { id: 'administration.settings.profile', label: 'Admin profile', description: 'Update the signed-in admin\'s name and email.' },
          { id: 'administration.settings.platform', label: 'Platform settings', description: 'Platform name, support email, maintenance mode.' },
          { id: 'administration.settings.notifications', label: 'Notifications', description: 'Admin notification preferences.' },
        ],
      },
      {
        id: 'administration.templates', label: 'Email templates',
        children: [
          { id: 'administration.templates.view', label: 'View templates', description: 'Preview transactional email content.' },
          { id: 'administration.templates.manage', label: 'Edit templates', description: 'Edit subject and body of email templates.' },
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
