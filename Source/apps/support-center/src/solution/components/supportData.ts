export type SupportTicketStatus = 'Open' | 'Waiting on you' | 'Resolved';

export interface SupportResource {
  id: string;
  productId: string;
  title: string;
  category: string;
  summary: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  productId: string;
  productName: string;
  status: SupportTicketStatus;
  updated: string;
  contact: string;
}

export const supportResources: SupportResource[] = [
  { id: 'r1', productId: 'optionc-school', title: 'Accessing Parent Portal with a Staff Login', category: 'Accounts & access', summary: 'Open the Parent Portal while signed in as staff without losing your staff session.' },
  { id: 'r2', productId: 'optionc-school', title: 'Accessing Parent/Teacher Conferences as a Teacher', category: 'My Classes', summary: 'Review conference schedules, family availability, and teacher-facing conference actions.' },
  { id: 'r3', productId: 'optionc-school', title: 'Accessing the Family Profile', category: 'Student records', summary: 'Find household contacts, family relationships, permissions, and student-linked information.' },
  { id: 'r4', productId: 'optionc-school', title: 'Create and Run Ad Hoc Reports', category: 'Reports', summary: 'Build a reusable filtered report from school data and export the result.' },
  { id: 'r5', productId: 'optionc-school', title: 'Add a New Relative to a Family', category: 'Student records', summary: 'Add a household relative and connect the appropriate student relationships.' },
  { id: 'r6', productId: 'optionc-school', title: 'Add an Assignment', category: 'Gradebook', summary: 'Create an assignment, set scoring details, and publish it to the selected class.' },
  { id: 'r7', productId: 'matt-money', title: 'Review a Tuition Payment and Reconciliation Status', category: 'Payments', summary: 'Trace a family payment from collection through settlement and reconciliation.' },
  { id: 'r8', productId: 'arc-alerts', title: 'Check Delivery Results for an Alert', category: 'Delivery', summary: 'Review text, email, voicemail, and push delivery results after an alert is sent.' },
  { id: 'r9', productId: 'optionc-parish', title: 'Update a Household or Sacrament Record', category: 'Parish records', summary: 'Locate a parish household and maintain the associated family or sacrament details.' },
  { id: 'r10', productId: 'catholic-content', title: 'Find and Download a Catholic Content Resource', category: 'Content library', summary: 'Search by saint, topic, or content type, preview a resource, and download it for authorized use.' },
  { id: 'r11', productId: 'unified-directory', title: 'Review a User and Group Membership', category: 'Directory', summary: 'Find an organization user and review role, status, and group membership information.' },
  { id: 'r12', productId: 'support-center', title: 'Track a Support Request to Resolution', category: 'Member Services', summary: 'Follow an open request, respond when it is waiting on you, and confirm the resolution.' },
];

export const initialSupportTickets: SupportTicket[] = [
  { id: 'CS-52190', subject: 'My Classes — roster access', productId: 'optionc-school', productName: 'OptionC School', status: 'Open', updated: 'Today, 10:24 AM', contact: 'School Support' },
  { id: 'CS-51984', subject: 'ArcAlerts delivery report question', productId: 'arc-alerts', productName: 'ArcAlerts', status: 'Waiting on you', updated: 'Yesterday, 3:42 PM', contact: 'Communication Support' },
  { id: 'CS-51611', subject: 'Directory export request', productId: 'unified-directory', productName: 'Unified Directory', status: 'Resolved', updated: 'Aug 5, 2026', contact: 'Member Services' },
];
