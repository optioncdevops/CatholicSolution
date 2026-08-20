import { availableSwitcherApps } from '@shared/app/config/appCatalog';
import { DIRECTORY_RECIPIENTS } from '@shared/app/data/directoryRecipients';

export type DirectoryPhone = {
  type: 'Home' | 'Work' | 'Mobile';
  number: string;
  extension?: string;
  unlisted: boolean;
  primary: boolean;
};

export type DirectoryEmail = {
  type: 'Home' | 'Work' | 'Organization';
  address: string;
  primary: boolean;
};

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phones: DirectoryPhone[];
  emails: DirectoryEmail[];
  applications: string[];
  groups: string[];
  active: boolean;
  lastAccessed: string;
  source: string;
};

export type DirectoryGroup = {
  id: string;
  name: string;
  memberIds: string[];
  owner: string;
  description: string;
};

export const directoryApplications = availableSwitcherApps.map((app) => app.name);
export const userAssignableApplications = ['Matt Money', 'ArcAlerts'] as const;

const groupNames = ['School Admins', 'Faculty', 'Parish Team', 'Volunteers', 'Finance', 'Faith Formation', 'Family Communications', 'Member Services', 'Grade 7 Families', 'Liturgy Team', 'Donor Relations', 'Event Volunteers'];
const firstNames = ['Carl', 'Meera', 'Daniel', 'Anna', 'Michael', 'Teresa', 'James', 'Maria', 'Joseph', 'Grace', 'Paul', 'Monica', 'Thomas', 'Sarah', 'David', 'Rachel', 'Anthony', 'Elena', 'Peter', 'Clara'];
const lastNames = ['Lapp', 'Shah', 'Joseph', 'Rodrigues', 'Chen', 'Gomez', 'Martin', 'Lewis', 'Rivera', 'Patel', 'Davis', 'Wilson', 'Murphy', 'Clark', 'Young', 'Turner', 'Hall', 'Adams', 'Baker', 'King'];
const domains = ['optionc.com', 'stmarys.org', 'stjoseph.org', 'holyfamily.edu', 'sacredheart.org'];

function appsFor(index: number) {
  const primary = directoryApplications[index % directoryApplications.length];
  const secondary = directoryApplications[(index + 3) % directoryApplications.length];
  return index % 4 === 0 && secondary !== primary ? [primary, secondary] : [primary];
}
function groupsFor(index: number) {
  const primary = groupNames[index % groupNames.length];
  const secondary = groupNames[(index + 3) % groupNames.length];
  return index % 3 === 0 ? [primary, secondary] : [primary];
}

function buildUsers(): DirectoryUser[] {
  const projectedUsers: DirectoryUser[] = DIRECTORY_RECIPIENTS.map((member, index) => {
    const primaryApp = index % 2 === 0 ? 'ArcAlerts' : 'Matt Money';
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      phones: member.phones.map((item) => ({ ...item, unlisted: Boolean(item.unlisted), primary: Boolean(item.primary) })),
      emails: member.emails.map((item) => ({ ...item, primary: Boolean(item.primary) })),
      applications: [primaryApp],
      groups: [...member.groups],
      active: true,
      lastAccessed: index < 6 ? 'Today' : `${1 + (index % 5)} days ago`,
      source: primaryApp,
    };
  });

  const generatedUsers = Array.from({ length: 132 - projectedUsers.length }, (_, offset) => {
    const index = offset + projectedUsers.length;
    const first = firstNames[index % firstNames.length];
    const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const suffix = index >= firstNames.length * lastNames.length ? `${index + 1}` : '';
    const name = `${first} ${last}${suffix ? ` ${suffix}` : ''}`;
    const applications = appsFor(index);
    const active = index % 8 !== 7;
    const email = `${first}.${last}${suffix}`.toLowerCase().replace(/\s+/g, '') + `@${domains[index % domains.length]}`;
    const phone = `+1 (215) 555-${String(1000 + index).slice(-4)}`;
    return {
      id: `u${index + 1}`,
      name,
      email,
      phone,
      phones: [
        { type: 'Home' as const, number: phone, unlisted: false, primary: index % 3 === 0 },
        { type: 'Work' as const, number: `+1 (267) 555-${String(2000 + index).slice(-4)}`, extension: index % 4 === 0 ? String(100 + index) : undefined, unlisted: index % 11 === 0, primary: index % 3 === 1 },
        { type: 'Mobile' as const, number: `+1 (484) 555-${String(3000 + index).slice(-4)}`, unlisted: false, primary: index % 3 === 2 },
      ],
      emails: [
        { type: 'Home' as const, address: email, primary: index % 3 === 0 },
        { type: 'Work' as const, address: `${first}.${last}@optionc.com`.toLowerCase(), primary: index % 3 === 1 },
        { type: 'Organization' as const, address: `${first[0]}${last}@${domains[(index + 1) % domains.length]}`.toLowerCase(), primary: index % 3 === 2 },
      ],
      applications,
      groups: groupsFor(index),
      active,
      lastAccessed: active ? (index < 20 ? 'Today' : `${1 + (index % 11)} days ago`) : `${12 + (index % 45)} days ago`,
      source: applications[0] ?? 'Unified Directory',
    } satisfies DirectoryUser;
  });

  return [...projectedUsers, ...generatedUsers];
}
export const initialUsers = buildUsers();

const groupDefinitions = [
  { id: 'g1', name: 'School Admins', owner: 'Carl Lapp', description: 'Administrative users for school leadership and office operations.' },
  { id: 'g2', name: 'Faculty', owner: 'Academic Office', description: 'Teaching staff and academic support users.' },
  { id: 'g3', name: 'Parish Team', owner: 'Parish Office', description: 'Parish office staff and ministry coordinators.' },
  { id: 'g4', name: 'Volunteers', owner: 'Community Office', description: 'Active volunteers available for service opportunities.' },
  { id: 'g5', name: 'Finance', owner: 'Business Office', description: 'Financial operations and reporting users.' },
  { id: 'g6', name: 'Faith Formation', owner: 'Religious Education', description: 'Catechists and faith-formation coordinators.' },
  { id: 'g7', name: 'Family Communications', owner: 'School Office', description: 'Contacts approved for school and family communications.' },
  { id: 'g8', name: 'Member Services', owner: 'Catholic Solutions', description: 'Member-services and organization support contacts.' },
  { id: 'g9', name: 'Grade 7 Families', owner: 'School Office', description: 'Grade 7 family contacts used for school services and communications.' },
  { id: 'g10', name: 'Liturgy Team', owner: 'Parish Office', description: 'Liturgical ministers, schedulers, and parish service coordinators.' },
  { id: 'g11', name: 'Donor Relations', owner: 'Development Office', description: 'Staff coordinating giving, acknowledgements, and donor follow-up.' },
  { id: 'g12', name: 'Event Volunteers', owner: 'Community Office', description: 'Volunteers assigned to current school and parish events.' },
];

export const initialGroups: DirectoryGroup[] = groupDefinitions.map((group) => ({
  ...group,
  memberIds: initialUsers.filter((user) => user.groups.includes(group.name)).map((user) => user.id),
}));

export function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}
