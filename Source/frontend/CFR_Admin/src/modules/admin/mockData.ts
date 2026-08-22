import type { AccessRequest, ActivityItem, AdminApplication, AdminRole, AdminUser, Organization } from './types';

export const MOCK_ROLES: AdminRole[] = [
  { id: 'role-super-admin', name: 'Super Admin', description: 'Full control across all organizations, products, and platform settings.', landingPage: 'Dashboard', createdAt: '2025-01-05' },
  { id: 'role-org-admin', name: 'Org Admin', description: 'Manages users, requests, and product access for their own organization.', landingPage: 'Organizations', createdAt: '2025-01-05' },
  { id: 'role-support-agent', name: 'Support Agent', description: 'Reviews and resolves access requests on behalf of organizations.', landingPage: 'Requests', createdAt: '2025-02-11' },
  { id: 'role-billing-manager', name: 'Billing Manager', description: 'Manages subscription plans and billing for assigned organizations.', landingPage: 'Organizations', createdAt: '2025-03-02' },
  { id: 'role-content-editor', name: 'Content Editor', description: 'Manages product catalog descriptions, categories, and metadata.', landingPage: 'Products', createdAt: '2025-04-18' },
  { id: 'role-viewer', name: 'Viewer', description: 'Read-only access to dashboards and reports across the platform.', landingPage: 'Dashboard', createdAt: '2025-05-27' },
];

export const MOCK_APPLICATIONS: AdminApplication[] = [
  {
    id: 'optionc-school', registryRef: 'reg_app_0001', sourceLocation: 'SaaS_Apps/optionc-school',
    name: 'OptionC School', shortName: 'School', category: 'Student Information System',
    icon: '🎓', gradient: 'linear-gradient(135deg,#1E3A8A,#3B82F6)',
    description: 'Comprehensive student information and academic management — attendance, gradebook, report cards and a parent portal in one place.',
    features: ['Attendance', 'Gradebook', 'Report cards', 'Parent portal'],
    integrations: ['Matt Money', 'ArcAlerts'],
    productionUrl: 'https://optionc-sms.optioncapp.com',
    ownership: 'first-party', deploymentModel: 'external-saas', navigationTarget: 'same-tab',
    status: 'active', visibility: 'public', updatedAt: '2026-08-12',
  },
  {
    id: 'optionc-parish', registryRef: 'reg_app_0002', sourceLocation: 'SaaS_Apps/optionc-parish',
    name: 'Parish Hub', shortName: 'Parish', category: 'Parish Administration',
    icon: '✝️', gradient: 'linear-gradient(135deg,#166534,#22C55E)',
    description: 'Integrated tools to manage your parish community and sacraments — family records, sacrament registers and Mass intentions.',
    features: ['Sacrament records', 'Family directory', 'Mass intentions', 'Certificates'],
    integrations: ['Matt Money', 'ArcAlerts'],
    productionUrl: 'https://optionc-parish.optioncapp.com',
    ownership: 'first-party', deploymentModel: 'external-saas', navigationTarget: 'same-tab',
    status: 'active', visibility: 'public', updatedAt: '2026-08-09',
  },
  {
    id: 'matt-money', registryRef: 'reg_app_0003', sourceLocation: 'SaaS_Apps/matt-money',
    name: 'Matt Money', shortName: 'Matt Money', category: 'Billing & Finance',
    icon: '💰', gradient: 'linear-gradient(135deg,#0F766E,#34D399)',
    description: 'Seamless online payment processing and financial tracking — tuition billing, donations and automatic reconciliation.',
    features: ['Online payments', 'Tuition billing', 'Donations', 'Auto-reconcile'],
    integrations: ['OptionC School', 'Parish Hub'],
    productionUrl: 'https://matt-money.optioncapp.com',
    ownership: 'first-party', deploymentModel: 'external-saas', navigationTarget: 'same-tab',
    status: 'on-request', visibility: 'public', updatedAt: '2026-08-05',
  },
  {
    id: 'arc-alerts', registryRef: 'reg_app_0004', sourceLocation: 'SaaS_Apps/arc-alerts',
    name: 'ArcAlerts', shortName: 'ArcAlerts', category: 'Emergency Communication',
    icon: '🔔', gradient: 'linear-gradient(135deg,#B91C1C,#EF4444)',
    description: 'Instant multi-channel notifications via text, email, and voicemail — reach every parent, staff member and parishioner in under a minute.',
    features: ['Text', 'Email', 'Voicemail', 'Templates'],
    integrations: ['OptionC School'],
    // Intentionally duplicated with Matt Money's domain below to demonstrate the
    // "duplicate domain" validation warning surfaced in Product Details.
    productionUrl: 'https://matt-money.optioncapp.com',
    ownership: 'first-party', deploymentModel: 'external-saas', navigationTarget: 'same-tab',
    status: 'on-request', visibility: 'public', updatedAt: '2026-07-30',
  },
  {
    id: 'catholic-content', registryRef: 'reg_app_0005', sourceLocation: 'SaaS_Apps/catholic-content',
    name: 'Catholic Content', shortName: 'Content', category: 'Faith Resources',
    icon: '📚', gradient: 'linear-gradient(135deg,#5B21B6,#8B5CF6)',
    description: 'Over 1,600 faith-based resources including workbooks, coloring pages, and more — searchable by grade, season and topic.',
    features: ['Workbooks', 'Coloring pages', 'Videos', 'Search by grade'],
    integrations: ['OptionC School'],
    productionUrl: 'https://catholic-content.optioncapp.com',
    ownership: 'first-party', deploymentModel: 'external-saas', navigationTarget: 'same-tab',
    status: 'coming-soon', visibility: 'hidden', updatedAt: '2026-07-22',
  },
  {
    id: 'unified-directory', registryRef: 'reg_app_0006', sourceLocation: 'SaaS_Apps/unified-directory',
    name: 'Unified Directory', shortName: 'Directory', category: 'Identity & Access',
    icon: '👥', gradient: 'linear-gradient(135deg,#075985,#0EA5E9)',
    description: 'Add and manage people and groups across Catholic Solutions from one shared organization directory.',
    features: ['Active/inactive users', 'SaaS app access', 'Groups', 'Membership management'],
    integrations: [],
    productionUrl: 'https://directory.optioncapp.com',
    ownership: 'first-party', deploymentModel: 'external-saas', navigationTarget: 'same-tab',
    status: 'inactive', visibility: 'hidden', updatedAt: '2026-07-18',
  },
  {
    id: 'support-center', registryRef: 'reg_app_0007', sourceLocation: 'SaaS_Apps/support-center',
    name: 'Support Center', shortName: 'Support', category: 'Member Services',
    icon: '🛟', gradient: 'linear-gradient(135deg,#164E63,#0E7490)',
    description: 'Submit support tickets and keep the complete conversation history for every Catholic Solutions request in one workspace.',
    features: ['Ticket inbox', 'Conversation history', 'Attachments', 'Product routing'],
    integrations: ['ArcAlerts'],
    // Intentionally non-HTTPS and marked as a partner product on a first-party (optioncapp.com)
    // domain to demonstrate two other validation warnings.
    productionUrl: 'http://support-center.optioncapp.com',
    ownership: 'partner', deploymentModel: 'external-saas', navigationTarget: 'same-tab',
    status: 'coming-soon', visibility: 'hidden', updatedAt: '2026-07-02',
  },
  {
    id: 'ai-lesson-plan', registryRef: 'reg_app_0008', sourceLocation: 'SaaS_Apps/ai-lesson-plan',
    name: 'AI Lesson Plan Generator', shortName: 'Lesson Plans', category: 'AI · Teaching',
    icon: '📝', gradient: 'linear-gradient(135deg,#D97706,#FBBF24)',
    description: 'Generate faith-integrated lesson plans from a short description of the class and topic.',
    features: ['Lesson planning', 'AI drafting', 'Teaching workflow'],
    integrations: ['OptionC School'],
    // Intentionally blank and still marked public while archived, to demonstrate the
    // "missing production URL" and "archived product still visible" warnings.
    productionUrl: '',
    ownership: 'first-party', deploymentModel: 'external-saas', navigationTarget: 'new-tab',
    status: 'archived', visibility: 'public', updatedAt: '2026-06-28',
  },
];

export const MOCK_ORGANIZATIONS: Organization[] = [
  { id: 'org-holy-family', name: 'Holy Family Academy', domain: 'holyfamilyacademy.edu', plan: 'growth', status: 'active', appIds: ['optionc-school', 'matt-money', 'arc-alerts'], createdAt: '2025-01-14' },
  { id: 'org-st-anne', name: 'St. Anne Parish', domain: 'stanneparish.org', plan: 'starter', status: 'active', appIds: ['optionc-parish'], createdAt: '2025-02-27' },
  { id: 'org-sacred-heart', name: 'Sacred Heart Diocese', domain: 'sacredheartdiocese.org', plan: 'enterprise', status: 'active', appIds: ['optionc-school', 'optionc-parish', 'matt-money', 'arc-alerts'], createdAt: '2024-11-03' },
  { id: 'org-st-jude', name: 'St. Jude School', domain: 'stjudeschool.edu', plan: 'growth', status: 'trial', appIds: ['optionc-school'], createdAt: '2026-06-19' },
  { id: 'org-our-lady', name: 'Our Lady of Grace', domain: 'ourladyofgrace.org', plan: 'starter', status: 'active', appIds: ['optionc-parish', 'matt-money'], createdAt: '2025-05-08' },
  { id: 'org-st-benedict', name: "St. Benedict's College Prep", domain: 'stbenedictprep.edu', plan: 'enterprise', status: 'suspended', appIds: ['optionc-school', 'matt-money'], createdAt: '2024-08-30' },
  { id: 'org-immaculate', name: 'Immaculate Conception Parish', domain: 'immaculateconception.org', plan: 'starter', status: 'trial', appIds: [], createdAt: '2026-08-01' },
];

const FIRST_NAMES = ['Carl', 'Maria', 'James', 'Anna', 'Vikram', 'Elena', 'Thomas', 'Grace', 'Miguel', 'Priya', 'Daniel', 'Sofia', 'Peter', 'Rosa', 'Lucas', 'Teresa', 'Marcus', 'Julia', 'Noah', 'Camila'];
const LAST_NAMES = ['Fernandes', 'Rodriguez', 'Kim', 'Johnson', 'Rao', 'Novak', 'Bennett', 'Alvarez', 'Sullivan', 'Nair', 'Costa', 'Reyes', 'Walsh', 'Moreau', 'Chen', 'Diaz', 'Murphy', 'Okafor', 'Lindqvist', 'Santos'];
const ROLES: AdminUser['role'][] = ['owner', 'admin', 'member', 'member', 'member'];
const STATUSES: AdminUser['status'][] = ['active', 'active', 'active', 'invited', 'deactivated'];

function seededUsers(): AdminUser[] {
  const users: AdminUser[] = [];
  let index = 0;
  for (const org of MOCK_ORGANIZATIONS) {
    const count = org.id === 'org-immaculate' ? 1 : 2 + (index % 3);
    for (let i = 0; i < count; i += 1) {
      const first = FIRST_NAMES[index % FIRST_NAMES.length];
      const last = LAST_NAMES[(index * 3) % LAST_NAMES.length];
      const role = i === 0 ? 'owner' : ROLES[index % ROLES.length];
      const status = i === 0 ? 'active' : STATUSES[index % STATUSES.length];
      users.push({
        id: `user-${org.id}-${i}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@${org.domain}`,
        role,
        status,
        orgId: org.id,
        appAccessIds: status === 'deactivated' ? [] : org.appIds.slice(0, 1 + (index % Math.max(org.appIds.length, 1))),
        lastActiveAt: `2026-08-${String(1 + ((index * 7) % 19)).padStart(2, '0')}`,
      });
      index += 1;
    }
  }
  return users;
}

export const MOCK_USERS: AdminUser[] = seededUsers();

function timeline(entries: Array<[RequestTimelineEntryStatus, string, string, string?]>) {
  return entries.map(([status, at, actor, note]) => ({ status, at, actor, note }));
}
type RequestTimelineEntryStatus = 'submitted' | 'pending' | 'approved' | 'rejected' | 'info-requested';

export const MOCK_REQUESTS: AccessRequest[] = [
  {
    id: 'req-1001', orgId: 'org-st-jude', requesterName: 'Grace Bennett', requesterEmail: 'grace.bennett@stjudeschool.edu', appId: 'matt-money', status: 'pending', submittedAt: '2026-08-18',
    timeline: timeline([['submitted', '2026-08-18', 'Grace Bennett']]),
  },
  {
    id: 'req-1002', orgId: 'org-our-lady', requesterName: 'Miguel Sullivan', requesterEmail: 'miguel.sullivan@ourladyofgrace.org', appId: 'arc-alerts', status: 'pending', submittedAt: '2026-08-17',
    timeline: timeline([['submitted', '2026-08-17', 'Miguel Sullivan']]),
  },
  {
    id: 'req-1003', orgId: 'org-immaculate', requesterName: 'Priya Nair', requesterEmail: 'priya.nair@immaculateconception.org', appId: 'optionc-parish', status: 'info-requested', submittedAt: '2026-08-14',
    timeline: timeline([
      ['submitted', '2026-08-14', 'Priya Nair'],
      ['info-requested', '2026-08-15', 'Admin', 'Please confirm the diocesan approval reference number.'],
    ]),
  },
  {
    id: 'req-1004', orgId: 'org-holy-family', requesterName: 'Daniel Costa', requesterEmail: 'daniel.costa@holyfamilyacademy.edu', appId: 'arc-alerts', status: 'approved', submittedAt: '2026-08-10',
    timeline: timeline([
      ['submitted', '2026-08-10', 'Daniel Costa'],
      ['approved', '2026-08-11', 'Admin', 'Approved — existing plan covers this application.'],
    ]),
  },
  {
    id: 'req-1005', orgId: 'org-st-benedict', requesterName: 'Sofia Reyes', requesterEmail: 'sofia.reyes@stbenedictprep.edu', appId: 'matt-money', status: 'rejected', submittedAt: '2026-08-06',
    timeline: timeline([
      ['submitted', '2026-08-06', 'Sofia Reyes'],
      ['rejected', '2026-08-07', 'Admin', 'Organization is currently suspended pending billing review.'],
    ]),
  },
  {
    id: 'req-1006', orgId: 'org-sacred-heart', requesterName: 'Thomas Walsh', requesterEmail: 'thomas.walsh@sacredheartdiocese.org', appId: 'optionc-school', status: 'pending', submittedAt: '2026-08-19',
    timeline: timeline([['submitted', '2026-08-19', 'Thomas Walsh']]),
  },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'act-1', message: 'Approved ArcAlerts access for Holy Family Academy', at: '2026-08-11', actor: 'Admin', kind: 'request' },
  { id: 'act-2', message: 'Marked St. Benedict\'s College Prep as suspended', at: '2026-08-09', actor: 'Admin', kind: 'organization' },
  { id: 'act-3', message: 'Published Catholic Content as Coming Soon', at: '2026-07-22', actor: 'Admin', kind: 'application' },
  { id: 'act-4', message: 'Deactivated 2 inactive user accounts at St. Jude School', at: '2026-07-20', actor: 'Admin', kind: 'user' },
  { id: 'act-5', message: 'Rejected Matt Money access request from St. Benedict\'s College Prep', at: '2026-08-07', actor: 'Admin', kind: 'request' },
];
