import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Report, Announcement, Document, PageName } from './types';
import {
  initializeStore,
  getUsers, saveUsers,
  getReports, saveReports,
  getAnnouncements, saveAnnouncements,
  getDocuments, saveDocuments,
  getSession, setSession, clearSession,
  generateId,
} from './store';

interface AppCtx {
  currentUser: User | null;
  page: PageName;
  setPage: (p: PageName) => void;
  users: User[];
  reports: Report[];
  announcements: Announcement[];
  documents: Document[];
  login: (email: string, password: string) => 'ok' | 'invalid' | 'pending' | 'inactive';
  logout: () => void;
  register: (data: Omit<User, 'id' | 'role' | 'points' | 'status' | 'createdAt'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;
  submitReport: (data: Pick<Report, 'authorId' | 'description' | 'photoUrl' | 'link'>) => void;
  reviewReport: (id: string, status: 'Approved' | 'Rejected', comment: string, points: number) => void;
  createAnnouncement: (title: string, content: string) => void;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  createDocument: (title: string, description: string, fileUrl: string) => void;
  deleteDocument: (id: string) => void;
}

const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

function init() {
  initializeStore();
  const users = getUsers();
  const sessionId = getSession();
  const currentUser = sessionId ? (users.find(u => u.id === sessionId && u.status === 'Active') ?? null) : null;
  return { users, currentUser };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [{ users, currentUser: initUser }] = useState(init);
  const [usersState, setUsersState] = useState<User[]>(users);
  const [reportsState, setReportsState] = useState<Report[]>(getReports);
  const [announcementsState, setAnnouncementsState] = useState<Announcement[]>(getAnnouncements);
  const [documentsState, setDocumentsState] = useState<Document[]>(getDocuments);
  const [currentUser, setCurrentUser] = useState<User | null>(initUser);
  const [page, setPage] = useState<PageName>('dashboard');

  const setUsers = (u: User[]) => { saveUsers(u); setUsersState(u); };
  const setReports = (r: Report[]) => { saveReports(r); setReportsState(r); };
  const setAnnouncements = (a: Announcement[]) => { saveAnnouncements(a); setAnnouncementsState(a); };
  const setDocuments = (d: Document[]) => { saveDocuments(d); setDocumentsState(d); };

  function login(email: string, password: string): 'ok' | 'invalid' | 'pending' | 'inactive' {
    const user = usersState.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === btoa(password));
    if (!user) return 'invalid';
    if (user.status === 'Pending') return 'pending';
    if (user.status === 'Inactive') return 'inactive';
    setCurrentUser(user);
    setSession(user.id);
    setPage('dashboard');
    return 'ok';
  }

  function logout() {
    setCurrentUser(null);
    clearSession();
  }

  function register(data: Omit<User, 'id' | 'role' | 'points' | 'status' | 'createdAt'>) {
    const newUser: User = {
      ...data,
      id: generateId(),
      role: 'Member',
      points: 0,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setUsers([...usersState, newUser]);
  }

  function updateUser(id: string, data: Partial<User>) {
    const updated = usersState.map(u => (u.id === id ? { ...u, ...data } : u));
    setUsers(updated);
    if (currentUser?.id === id) {
      setCurrentUser(updated.find(u => u.id === id) ?? null);
    }
  }

  function approveUser(id: string) {
    updateUser(id, { status: 'Active' });
  }

  function rejectUser(id: string) {
    const updated = usersState.map(u => (u.id === id ? { ...u, status: 'Pending' as const } : u));
    setUsers(updated);
  }

  function submitReport(data: Pick<Report, 'authorId' | 'description' | 'photoUrl' | 'link'>) {
    const newReport: Report = {
      ...data,
      id: generateId(),
      status: 'Pending',
      awardedPoints: 0,
      reviewerComment: '',
      reviewedBy: '',
      createdDate: new Date().toISOString(),
      reviewedDate: '',
    };
    setReports([...reportsState, newReport]);
  }

  function reviewReport(id: string, status: 'Approved' | 'Rejected', comment: string, points: number) {
    const report = reportsState.find(r => r.id === id);
    const updated = reportsState.map(r =>
      r.id === id
        ? { ...r, status, reviewerComment: comment, reviewedBy: currentUser?.id ?? '', awardedPoints: points, reviewedDate: new Date().toISOString() }
        : r,
    );
    setReports(updated);
    if (status === 'Approved' && report) {
      const author = usersState.find(u => u.id === report.authorId);
      if (author) updateUser(author.id, { points: author.points + points });
    }
  }

  function createAnnouncement(title: string, content: string) {
    const a: Announcement = {
      id: generateId(),
      title,
      content,
      authorId: currentUser?.id ?? '',
      createdDate: new Date().toISOString(),
    };
    setAnnouncements([a, ...announcementsState]);
  }

  function updateAnnouncement(id: string, data: Partial<Announcement>) {
    setAnnouncements(announcementsState.map(a => (a.id === id ? { ...a, ...data } : a)));
  }

  function deleteAnnouncement(id: string) {
    setAnnouncements(announcementsState.filter(a => a.id !== id));
  }

  function createDocument(title: string, description: string, fileUrl: string) {
    const doc: Document = {
      id: generateId(),
      title,
      description,
      fileUrl,
      createdDate: new Date().toISOString(),
    };
    setDocuments([doc, ...documentsState]);
  }

  function deleteDocument(id: string) {
    setDocuments(documentsState.filter(d => d.id !== id));
  }

  const ctx: AppCtx = {
    currentUser, page, setPage,
    users: usersState,
    reports: reportsState,
    announcements: announcementsState,
    documents: documentsState,
    login, logout, register,
    updateUser, approveUser, rejectUser,
    submitReport, reviewReport,
    createAnnouncement, updateAnnouncement, deleteAnnouncement,
    createDocument, deleteDocument,
  };

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>;
}
