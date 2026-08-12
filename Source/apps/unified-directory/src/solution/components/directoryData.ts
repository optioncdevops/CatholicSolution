export type UserStatus = 'Active' | 'Invited' | 'Suspended';
export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  groups: string[];
  status: UserStatus;
  lastActive: string;
  source: string;
};

export type DirectoryGroup = {
  id: string;
  name: string;
  type: string;
  members: number;
  owner: string;
  apps: string[];
  description: string;
};

export const initialUsers: DirectoryUser[] = [
  { id: 'u1', name: 'Carl Lapp', email: 'carl.lapp@optionc.com', role: 'Administrator', groups: ['School Admins', 'Finance'], status: 'Active', lastActive: 'Today, 9:14 AM', source: 'OptionC School' },
  { id: 'u2', name: 'Meera Shah', email: 'meera.shah@stmarys.org', role: 'Teacher', groups: ['Faculty', 'Grade 7'], status: 'Active', lastActive: 'Today, 8:42 AM', source: 'OptionC School' },
  { id: 'u3', name: 'Daniel Joseph', email: 'daniel.j@stjoseph.org', role: 'Parish Staff', groups: ['Parish Team'], status: 'Active', lastActive: 'Yesterday, 4:18 PM', source: 'OptionC Parish' },
  { id: 'u4', name: 'Anna Rodrigues', email: 'anna.r@stmarys.org', role: 'Volunteer Coordinator', groups: ['Volunteers', 'Events'], status: 'Invited', lastActive: 'Invitation sent Aug 6', source: 'Manual invite' },
  { id: 'u5', name: 'Michael Chen', email: 'michael.chen@stmarys.org', role: 'Finance Staff', groups: ['Finance'], status: 'Active', lastActive: 'Aug 6, 2:10 PM', source: 'Matt Money' },
  { id: 'u6', name: 'Teresa Gomez', email: 'teresa.gomez@stjoseph.org', role: 'Catechist', groups: ['Parish Team', 'Faith Formation'], status: 'Suspended', lastActive: 'Jul 30, 11:22 AM', source: 'OptionC Parish' },
];

export const initialGroups: DirectoryGroup[] = [
  { id: 'g1', name: 'School Admins', type: 'Security group', members: 8, owner: 'Carl Lapp', apps: ['OptionC School', 'Unified Directory'], description: 'Administrative access for school leadership and office operations.' },
  { id: 'g2', name: 'Faculty', type: 'Organization group', members: 46, owner: 'Academic Office', apps: ['OptionC School', 'Catholic Content'], description: 'Teaching staff and academic support users.' },
  { id: 'g3', name: 'Parish Team', type: 'Organization group', members: 14, owner: 'Parish Office', apps: ['OptionC Parish', 'ArcAlerts'], description: 'Parish office staff and ministry coordinators.' },
  { id: 'g4', name: 'Volunteers', type: 'Program group', members: 24, owner: 'Anna Rodrigues', apps: ['Vincent Volunteer'], description: 'Active volunteers available for service opportunities.' },
  { id: 'g5', name: 'Finance', type: 'Security group', members: 5, owner: 'Business Office', apps: ['Matt Money'], description: 'Restricted financial operations and reporting access.' },
];

export function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}
