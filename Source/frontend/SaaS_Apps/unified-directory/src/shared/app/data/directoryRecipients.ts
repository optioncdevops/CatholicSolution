/**
 * Read-only recipient/contact projection shared by Unified Directory and communication products.
 * In production this projection is expected to come from the directory service/API.
 */
export type DirectoryPhoneType = 'Home' | 'Work' | 'Mobile';
export type DirectoryEmailType = 'Home' | 'Work' | 'Organization';

export interface DirectoryPhoneContact {
  type: DirectoryPhoneType;
  number: string;
  extension?: string;
  unlisted?: boolean;
  primary?: boolean;
}

export interface DirectoryEmailContact {
  type: DirectoryEmailType;
  address: string;
  primary?: boolean;
}

export interface DirectoryRecipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  phones: DirectoryPhoneContact[];
  emails: DirectoryEmailContact[];
  groups: string[];
}

type RecipientSeed = Omit<DirectoryRecipient, 'email' | 'phone'>;

function recipient(seed: RecipientSeed): DirectoryRecipient {
  const primaryPhone = seed.phones.find((item) => item.primary) ?? seed.phones[0];
  const primaryEmail = seed.emails.find((item) => item.primary) ?? seed.emails[0];
  return {
    ...seed,
    phone: primaryPhone?.number ?? '',
    email: primaryEmail?.address ?? '',
  };
}

export const DIRECTORY_RECIPIENTS: DirectoryRecipient[] = [
  recipient({
    id: 'u1',
    name: 'Carl Lapp',
    phones: [
      { type: 'Home', number: '(585) 555-5001' },
      { type: 'Work', number: '(585) 555-5555', extension: '201', primary: true },
      { type: 'Mobile', number: '(585) 555-7001' },
    ],
    emails: [
      { type: 'Work', address: 'carl.lapp@optionc.com', primary: true },
      { type: 'Organization', address: 'clapp@stmarys.org' },
    ],
    groups: ['School Admins', 'Family Communications'],
  }),
  recipient({
    id: 'u2',
    name: 'Meera Shah',
    phones: [{ type: 'Mobile', number: '(585) 555-5556', primary: true }],
    emails: [
      { type: 'Home', address: 'meera.shah@example.org' },
      { type: 'Work', address: 'meera.shah@stmarys.org', primary: true },
    ],
    groups: ['Faculty', 'Family Communications'],
  }),
  recipient({
    id: 'u3',
    name: 'Daniel Joseph',
    phones: [
      { type: 'Home', number: '(585) 555-5103' },
      { type: 'Mobile', number: '(585) 555-5557', primary: true },
    ],
    emails: [{ type: 'Work', address: 'daniel.joseph@stjoseph.org', primary: true }],
    groups: ['School Admins'],
  }),
  recipient({
    id: 'u4',
    name: 'Anna Rodrigues',
    phones: [{ type: 'Mobile', number: '(585) 555-5558', primary: true }],
    emails: [
      { type: 'Home', address: 'anna.rodrigues@example.org', primary: true },
      { type: 'Organization', address: 'arodrigues@holyfamily.edu' },
    ],
    groups: ['Grade 7 Families'],
  }),
  recipient({
    id: 'u5',
    name: 'Michael Chen',
    phones: [
      { type: 'Home', number: '(585) 555-5205' },
      { type: 'Work', number: '(585) 555-6205', extension: '118' },
      { type: 'Mobile', number: '(585) 555-5559', primary: true },
    ],
    emails: [
      { type: 'Work', address: 'michael.chen@sacredheart.org', primary: true },
      { type: 'Organization', address: 'mchen@sacredheart.org' },
    ],
    groups: ['Grade 7 Families', 'Family Communications'],
  }),
  recipient({
    id: 'u6',
    name: 'Teresa Gomez',
    phones: [
      { type: 'Work', number: '(585) 555-6306', unlisted: true },
      { type: 'Mobile', number: '(585) 555-5560', primary: true },
    ],
    emails: [{ type: 'Work', address: 'teresa.gomez@stmarys.org', primary: true }],
    groups: ['Faculty'],
  }),
  recipient({
    id: 'u7',
    name: 'James Martin',
    phones: [
      { type: 'Work', number: '(585) 555-5561', extension: '224', primary: true },
      { type: 'Mobile', number: '(585) 555-7107' },
    ],
    emails: [
      { type: 'Work', address: 'james.martin@optionc.com', primary: true },
      { type: 'Organization', address: 'member.services@optionc.com' },
    ],
    groups: ['Member Services'],
  }),
  recipient({
    id: 'u8',
    name: 'Maria Lewis',
    phones: [
      { type: 'Home', number: '(585) 555-5308', primary: true },
      { type: 'Mobile', number: '(585) 555-5562' },
    ],
    emails: [
      { type: 'Home', address: 'maria.lewis@example.org' },
      { type: 'Work', address: 'maria.lewis@stjoseph.org', primary: true },
    ],
    groups: ['Parish Team'],
  }),
  recipient({
    id: 'u9',
    name: 'Joseph Rivera',
    phones: [{ type: 'Mobile', number: '(585) 555-5563', primary: true }],
    emails: [{ type: 'Organization', address: 'joseph.rivera@holyfamily.edu', primary: true }],
    groups: ['Volunteers', 'Event Volunteers'],
  }),
  recipient({
    id: 'u10',
    name: 'Grace Patel',
    phones: [
      { type: 'Work', number: '(585) 555-6410', primary: true },
      { type: 'Mobile', number: '(585) 555-5564' },
    ],
    emails: [
      { type: 'Home', address: 'grace.patel@example.org' },
      { type: 'Work', address: 'grace.patel@sacredheart.org', primary: true },
    ],
    groups: ['Finance'],
  }),
  recipient({
    id: 'u11',
    name: 'Paul Davis',
    phones: [
      { type: 'Home', number: '(585) 555-5411' },
      { type: 'Work', number: '(585) 555-5565', primary: true },
    ],
    emails: [{ type: 'Work', address: 'paul.davis@stmarys.org', primary: true }],
    groups: ['Liturgy Team'],
  }),
  recipient({
    id: 'u12',
    name: 'Monica Wilson',
    phones: [
      { type: 'Home', number: '(585) 555-5512', primary: true },
      { type: 'Mobile', number: '(585) 555-5566' },
    ],
    emails: [
      { type: 'Home', address: 'monica.wilson@example.org' },
      { type: 'Organization', address: 'monica.wilson@stjoseph.org', primary: true },
    ],
    groups: ['Faith Formation'],
  }),
];

export const DIRECTORY_RECIPIENT_GROUPS = Array.from(new Set(DIRECTORY_RECIPIENTS.flatMap((recipient) => recipient.groups))).sort();
