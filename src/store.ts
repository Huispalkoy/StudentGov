import type { User, Report, Announcement, Document } from './types';

const KEYS = {
  users: 'sg_users',
  reports: 'sg_reports',
  announcements: 'sg_announcements',
  documents: 'sg_documents',
  session: 'sg_session',
};

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const getUsers = () => load<User>(KEYS.users);
export const saveUsers = (users: User[]) => save(KEYS.users, users);
export const getReports = () => load<Report>(KEYS.reports);
export const saveReports = (reports: Report[]) => save(KEYS.reports, reports);
export const getAnnouncements = () => load<Announcement>(KEYS.announcements);
export const saveAnnouncements = (a: Announcement[]) => save(KEYS.announcements, a);
export const getDocuments = () => load<Document>(KEYS.documents);
export const saveDocuments = (d: Document[]) => save(KEYS.documents, d);
export const getSession = () => localStorage.getItem(KEYS.session);
export const setSession = (id: string) => localStorage.setItem(KEYS.session, id);
export const clearSession = () => localStorage.removeItem(KEYS.session);

const seedUsers: User[] = [
  {
    id: 'u-president',
    fullName: 'Emma Rodriguez',
    class: '12A',
    phoneNumber: '+1 (555) 100-0001',
    telegramUsername: '@emma_r',
    structure: 'Government',
    role: 'president',
    points: 320,
    status: 'Active',
    email: 'president@school.edu',
    password: btoa('president'),
    createdAt: '2024-09-01T08:00:00Z',
  },
  {
    id: 'u-vp',
    fullName: 'Marcus Chen',
    class: '11B',
    phoneNumber: '+1 (555) 100-0002',
    telegramUsername: '@marcus_c',
    structure: 'Government',
    role: 'Vice President',
    points: 210,
    status: 'Active',
    email: 'vp@school.edu',
    password: btoa('vp123'),
    createdAt: '2024-09-01T08:30:00Z',
  },
  {
    id: 'u-member1',
    fullName: 'Sofia Patel',
    class: '10C',
    phoneNumber: '+1 (555) 100-0003',
    telegramUsername: '@sofia_p',
    structure: 'Government',
    role: 'Member',
    points: 85,
    status: 'Active',
    email: 'sofia@school.edu',
    password: btoa('member123'),
    createdAt: '2024-09-05T09:00:00Z',
  },
  {
    id: 'u-member2',
    fullName: 'James Wilson',
    class: '11A',
    phoneNumber: '+1 (555) 100-0004',
    telegramUsername: '@james_w',
    structure: 'Council of Class Presidents',
    role: 'Member',
    points: 60,
    status: 'Active',
    email: 'james@school.edu',
    password: btoa('member123'),
    createdAt: '2024-09-06T09:15:00Z',
  },
  {
    id: 'u-member3',
    fullName: 'Alicia Thompson',
    class: '10A',
    phoneNumber: '+1 (555) 100-0005',
    telegramUsername: '@alicia_t',
    structure: 'Council of Class Presidents',
    role: 'Member',
    points: 45,
    status: 'Active',
    email: 'alicia@school.edu',
    password: btoa('member123'),
    createdAt: '2024-09-07T10:00:00Z',
  },
  {
    id: 'u-member4',
    fullName: 'Daniel Kim',
    class: '9C',
    phoneNumber: '+1 (555) 100-0007',
    telegramUsername: '@daniel_k',
    structure: 'Government',
    role: 'Member',
    points: 30,
    status: 'Active',
    email: 'daniel@school.edu',
    password: btoa('member123'),
    createdAt: '2024-09-10T09:00:00Z',
  },
  {
    id: 'u-pending1',
    fullName: 'Noah Martinez',
    class: '9B',
    phoneNumber: '+1 (555) 100-0006',
    telegramUsername: '@noah_m',
    structure: 'Government',
    role: 'Member',
    points: 0,
    status: 'Pending',
    email: 'noah@school.edu',
    password: btoa('member123'),
    createdAt: '2024-10-01T11:00:00Z',
  },
  {
    id: 'u-pending2',
    fullName: 'Layla Hassan',
    class: '10B',
    phoneNumber: '+1 (555) 100-0008',
    telegramUsername: '@layla_h',
    structure: 'Council of Class Presidents',
    role: 'Member',
    points: 0,
    status: 'Pending',
    email: 'layla@school.edu',
    password: btoa('member123'),
    createdAt: '2024-10-03T14:00:00Z',
  },
];

const seedReports: Report[] = [
  {
    id: 'r1',
    authorId: 'u-member1',
    description:
      'Organized the school spirit week event, coordinated with teachers and arranged decorations for all classrooms. Approximately 200 students participated across all grades.',
    photoUrl:
      'https://images.unsplash.com/photo-1541178735493-479c1a27ed24?w=600&h=400&fit=crop&auto=format',
    link: 'https://school.edu/spirit-week-recap',
    status: 'Approved',
    awardedPoints: 25,
    reviewerComment: 'Excellent work organizing this event! The turnout was great.',
    reviewedBy: 'u-president',
    createdDate: '2024-10-05T14:00:00Z',
    reviewedDate: '2024-10-06T10:00:00Z',
  },
  {
    id: 'r2',
    authorId: 'u-member2',
    description:
      'Led a food drive campaign across 5 homeroom classes. Collected over 300 canned goods for the local food bank. Campaign ran for two weeks with daily reminders.',
    photoUrl: '',
    link: '',
    status: 'Pending',
    awardedPoints: 0,
    reviewerComment: '',
    reviewedBy: '',
    createdDate: '2024-10-10T16:00:00Z',
    reviewedDate: '',
  },
  {
    id: 'r3',
    authorId: 'u-member3',
    description:
      'Attempted to organize a student lounge cleanup. Participation was low — only 3 students showed up out of the 15 who signed up.',
    photoUrl: '',
    link: '',
    status: 'Rejected',
    awardedPoints: 0,
    reviewerComment: 'The event lacked proper promotion. Please plan more carefully next time and confirm attendees in advance.',
    reviewedBy: 'u-vp',
    createdDate: '2024-10-08T09:00:00Z',
    reviewedDate: '2024-10-09T08:00:00Z',
  },
  {
    id: 'r4',
    authorId: 'u-member4',
    description:
      'Helped coordinate the school fundraiser bake sale. Managed the sign-up sheet and collected money. Raised $340 for the student activities fund.',
    photoUrl: '',
    link: '',
    status: 'Pending',
    awardedPoints: 0,
    reviewerComment: '',
    reviewedBy: '',
    createdDate: '2024-10-12T11:00:00Z',
    reviewedDate: '',
  },
];

const seedAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Welcome to the New School Year!',
    content:
      'Dear student council members, welcome to the 2024–2025 academic year! We have exciting plans ahead including community events, fundraisers, and school improvement projects. Please check this platform regularly for updates and submit your activity reports promptly after completing any council work.',
    authorId: 'u-president',
    createdDate: '2024-09-02T09:00:00Z',
  },
  {
    id: 'a2',
    title: 'Monthly Meeting — October 15th',
    content:
      'Our monthly general assembly will be held on October 15th at 3:30 PM in Room 204. Attendance is mandatory for all council members. We will review Q1 activity reports, discuss upcoming fundraiser plans, and elect new committee leads. Please come prepared with a summary of your activities.',
    authorId: 'u-president',
    createdDate: '2024-10-08T10:00:00Z',
  },
  {
    id: 'a3',
    title: 'Activity Points Deadline — End of October',
    content:
      'As a reminder, all activity reports for October must be submitted by October 31st. Reports submitted after this date will not count toward this quarter\'s points total. Contact the VP if you have any questions about eligibility.',
    authorId: 'u-vp',
    createdDate: '2024-10-14T09:00:00Z',
  },
];

const seedDocuments: Document[] = [
  {
    id: 'd1',
    title: 'Student Council Constitution 2024',
    description:
      'The official governing document outlining the structure, responsibilities, election procedures, and code of conduct for all student council members.',
    fileUrl: '#',
    createdDate: '2024-09-01T08:00:00Z',
  },
  {
    id: 'd2',
    title: 'Activity Report Guidelines',
    description:
      'Instructions for submitting valid activity reports, including what qualifies for points, photo requirements, and the review timeline.',
    fileUrl: '#',
    createdDate: '2024-09-03T09:00:00Z',
  },
  {
    id: 'd3',
    title: 'Q1 Meeting Minutes',
    description:
      'Official minutes from the September general assembly. Covers attendance, decisions made, and action items assigned to each committee.',
    fileUrl: '#',
    createdDate: '2024-09-20T11:00:00Z',
  },
];

export function initializeStore(): void {
  if (!localStorage.getItem(KEYS.users)) saveUsers(seedUsers);
  if (!localStorage.getItem(KEYS.reports)) saveReports(seedReports);
  if (!localStorage.getItem(KEYS.announcements)) saveAnnouncements(seedAnnouncements);
  if (!localStorage.getItem(KEYS.documents)) saveDocuments(seedDocuments);
}
