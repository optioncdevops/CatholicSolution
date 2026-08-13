/**
 * Read-only recipient projection shared by Unified Directory and communication products.
 * In production this projection is expected to come from the directory service/API.
 */
export interface DirectoryRecipient {
  id: string;
  name: string;
  email: string;
  phone: string;
  groups: string[];
}

export const DIRECTORY_RECIPIENTS: DirectoryRecipient[] = [
  { id: 'u1', name: 'Carl Lapp', email: 'carl.lapp@optionc.com', phone: '(585) 555-5555', groups: ['School Admins', 'Family Communications'] },
  { id: 'u2', name: 'Meera Shah', email: 'meera.shah@stmarys.org', phone: '(585) 555-5556', groups: ['Faculty', 'Family Communications'] },
  { id: 'u3', name: 'Daniel Joseph', email: 'daniel.joseph@stjoseph.org', phone: '(585) 555-5557', groups: ['School Admins'] },
  { id: 'u4', name: 'Anna Rodrigues', email: 'anna.rodrigues@holyfamily.edu', phone: '(585) 555-5558', groups: ['Grade 7 Families'] },
  { id: 'u5', name: 'Michael Chen', email: 'michael.chen@sacredheart.org', phone: '(585) 555-5559', groups: ['Grade 7 Families', 'Family Communications'] },
  { id: 'u6', name: 'Teresa Gomez', email: 'teresa.gomez@stmarys.org', phone: '(585) 555-5560', groups: ['Faculty'] },
  { id: 'u7', name: 'James Martin', email: 'james.martin@optionc.com', phone: '(585) 555-5561', groups: ['Member Services'] },
  { id: 'u8', name: 'Maria Lewis', email: 'maria.lewis@stjoseph.org', phone: '(585) 555-5562', groups: ['Parish Team'] },
  { id: 'u9', name: 'Joseph Rivera', email: 'joseph.rivera@holyfamily.edu', phone: '(585) 555-5563', groups: ['Volunteers', 'Event Volunteers'] },
  { id: 'u10', name: 'Grace Patel', email: 'grace.patel@sacredheart.org', phone: '(585) 555-5564', groups: ['Finance'] },
  { id: 'u11', name: 'Paul Davis', email: 'paul.davis@stmarys.org', phone: '(585) 555-5565', groups: ['Liturgy Team'] },
  { id: 'u12', name: 'Monica Wilson', email: 'monica.wilson@stjoseph.org', phone: '(585) 555-5566', groups: ['Faith Formation'] },
];

export const DIRECTORY_RECIPIENT_GROUPS = Array.from(new Set(DIRECTORY_RECIPIENTS.flatMap((recipient) => recipient.groups))).sort();
