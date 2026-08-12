import { availableSwitcherApps } from '@shared/app/config/appCatalog';

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  applications: string[];
  groups: string[];
  active: boolean;
  lastActive: string;
  source: string;
};

export type DirectoryGroup = {
  id: string;
  name: string;
  memberIds: string[];
  owner: string;
  apps: string[];
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
  return Array.from({ length: 132 }, (_, index) => {
    const first = firstNames[index % firstNames.length];
    const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const suffix = index >= firstNames.length * lastNames.length ? `${index + 1}` : '';
    const name = `${first} ${last}${suffix ? ` ${suffix}` : ''}`;
    const applications = appsFor(index);
    const active = index % 8 !== 7;
    return {
      id: `u${index + 1}`,
      name,
      email: `${first}.${last}${suffix}`.toLowerCase().replace(/\s+/g, '') + `@${domains[index % domains.length]}`,
      phone: `+1 (215) 555-${String(1000 + index).slice(-4)}`,
      applications,
      groups: groupsFor(index),
      active,
      lastActive: active ? (index < 12 ? 'Today' : `${1 + (index % 11)} days ago`) : `${12 + (index % 45)} days ago`,
      source: applications[0] ?? 'Unified Directory',
    };
  });
}

export const initialUsers = buildUsers();

const groupDefinitions = [
  { id: 'g1', name: 'School Admins', owner: 'Carl Lapp', apps: ['OptionC School', 'Unified Directory'], description: 'Administrative access for school leadership and office operations.' },
  { id: 'g2', name: 'Faculty', owner: 'Academic Office', apps: ['OptionC School', 'Catholic Content'], description: 'Teaching staff and academic support users.' },
  { id: 'g3', name: 'Parish Team', owner: 'Parish Office', apps: ['OptionC Parish', 'ArcAlerts'], description: 'Parish office staff and ministry coordinators.' },
  { id: 'g4', name: 'Volunteers', owner: 'Community Office', apps: ['Vincent Volunteer'], description: 'Active volunteers available for service opportunities.' },
  { id: 'g5', name: 'Finance', owner: 'Business Office', apps: ['Matt Money'], description: 'Financial operations and reporting access.' },
  { id: 'g6', name: 'Faith Formation', owner: 'Religious Education', apps: ['Catholic Content', 'OptionC Parish'], description: 'Catechists and faith-formation coordinators.' },
  { id: 'g7', name: 'Family Communications', owner: 'School Office', apps: ['ArcAlerts', 'OptionC School'], description: 'Contacts approved for school and family communications.' },
  { id: 'g8', name: 'Member Services', owner: 'Catholic Solutions', apps: ['Support Center', 'Unified Directory'], description: 'Member-services and organization support contacts.' },
  { id: 'g9', name: 'Grade 7 Families', owner: 'School Office', apps: ['OptionC School', 'ArcAlerts'], description: 'Grade 7 family contacts used for school services and communications.' },
  { id: 'g10', name: 'Liturgy Team', owner: 'Parish Office', apps: ['OptionC Parish', 'Berchmans'], description: 'Liturgical ministers, schedulers, and parish service coordinators.' },
  { id: 'g11', name: 'Donor Relations', owner: 'Development Office', apps: ['Matt Money', 'OptionC Parish'], description: 'Staff coordinating giving, acknowledgements, and donor follow-up.' },
  { id: 'g12', name: 'Event Volunteers', owner: 'Community Office', apps: ['Vincent Volunteer', 'ArcAlerts'], description: 'Volunteers assigned to current school and parish events.' },
];

export const initialGroups: DirectoryGroup[] = groupDefinitions.map((group) => ({
  ...group,
  memberIds: initialUsers.filter((user) => user.groups.includes(group.name)).map((user) => user.id),
}));

export function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}
