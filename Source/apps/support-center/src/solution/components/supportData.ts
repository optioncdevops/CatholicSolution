export type SupportTicketStatus = 'Open' | 'Waiting on you' | 'Resolved';
export type SupportMessageAuthor = 'member' | 'support';

export interface SupportMessage {
  id: string;
  author: string;
  authorType: SupportMessageAuthor;
  sentAt: string;
  body: string;
  attachment?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  productId: string;
  productName: string;
  status: SupportTicketStatus;
  updated: string;
  contact: string;
  messages: SupportMessage[];
}

export const initialSupportTickets: SupportTicket[] = [
  {
    id: 'CS-52190', subject: 'My Classes — roster access', productId: 'optionc-school', productName: 'OptionC School', status: 'Open', updated: 'Today, 10:24 AM', contact: 'School Support',
    messages: [
      { id: 'm1', author: 'Carl Lapp', authorType: 'member', sentAt: 'Today, 9:48 AM', body: 'I can open My Classes, but the Grade 7 roster is not appearing for the current term. Can you confirm the access mapping?' },
      { id: 'm2', author: 'Maria · School Support', authorType: 'support', sentAt: 'Today, 10:06 AM', body: 'Thanks, Carl. We checked the organization mapping and found the class association. We are refreshing the roster permissions now.' },
      { id: 'm3', author: 'Maria · School Support', authorType: 'support', sentAt: 'Today, 10:24 AM', body: 'The refresh completed. Please sign in again and confirm whether Grade 7 now appears under My Classes.' },
    ],
  },
  {
    id: 'CS-51984', subject: 'ArcAlerts delivery report question', productId: 'arc-alerts', productName: 'ArcAlerts', status: 'Waiting on you', updated: 'Yesterday, 3:42 PM', contact: 'Communication Support',
    messages: [
      { id: 'm4', author: 'Carl Lapp', authorType: 'member', sentAt: 'Yesterday, 1:18 PM', body: 'The delivery summary and the downloadable report show different email totals for our weather alert.' },
      { id: 'm5', author: 'Daniel · Communication Support', authorType: 'support', sentAt: 'Yesterday, 2:05 PM', body: 'The summary counts unique recipients while the export includes each destination address. Could you send the alert ID so we can verify the totals?' },
      { id: 'm6', author: 'Daniel · Communication Support', authorType: 'support', sentAt: 'Yesterday, 3:42 PM', body: 'We are waiting for the alert ID. Once received, we can compare the recipient and destination-level counts for you.' },
    ],
  },
  {
    id: 'CS-51611', subject: 'Directory export request', productId: 'unified-directory', productName: 'Unified Directory', status: 'Resolved', updated: 'Aug 5, 2026', contact: 'Member Services',
    messages: [
      { id: 'm7', author: 'Carl Lapp', authorType: 'member', sentAt: 'Aug 4, 2026 · 11:12 AM', body: 'Can Member Services provide a current organization user export for our annual access review?' },
      { id: 'm8', author: 'Meera · Member Services', authorType: 'support', sentAt: 'Aug 4, 2026 · 1:30 PM', body: 'Yes. We generated the access-review export and attached it to the secure organization workspace.', attachment: 'Directory-Access-Review.csv' },
      { id: 'm9', author: 'Carl Lapp', authorType: 'member', sentAt: 'Aug 5, 2026 · 9:05 AM', body: 'Received. Thank you — the export has what we need.' },
    ],
  },
];
