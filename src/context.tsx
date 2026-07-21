import { signIn, signOut } from "./services/auth";
import { supabase } from "./lib/supabase";
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
  submitReport: (data: Pick<Report, 'authorId' | 'description' | 'photoUrl' | 'link'>) => Promise<void>;
  reviewReport: (
  id: string,
  status: 'approved' | 'rejected',
  comment: string,
  points: number
) => Promise<void>;
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

  const currentUser = sessionId
    ? (users.find(u => u.id === sessionId) ?? null)
    : null;

  return { users, currentUser };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [{ users, currentUser: initUser }] = useState(init);
  const [usersState, setUsersState] = useState<User[]>(users);
  const [reportsState, setReportsState] = useState<Report[]>([]);
  useEffect(() => {
  async function loadData() {

    // USERS
    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("*");


    if (!usersError) {

      const mappedUsers = (usersData ?? []).map(profile => ({
  id: profile.id,

  email: profile.email ?? "",

  firstName: profile.first_name ?? "",
  lastName: profile.last_name ?? "",

  className: profile.class ?? "",

  phone: profile.phone_number ?? "",

  telegram: profile.telegram_username ?? "",

  structure: profile.structure ?? "Government",

  role: profile.role ?? "member",

  status: profile.status?.toLowerCase() ?? "active",

  points: profile.points ?? 0,

  createdAt: profile.created_at ?? "",
}));

      setUsersState(mappedUsers);
    }


    // REPORTS
    const { data: reportsData, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .order("created_date", { ascending: false });


    console.log("REPORTS:", reportsData);
    console.log("REPORT ERROR:", reportsError);


    if (!reportsError) {

  const mappedReports = (reportsData ?? []).map(report => ({
    id: report.id,
    authorId: report.author_id,
    description: report.description,
    photoUrl: report.photo_url,
    link: report.link,

    status: report.status,

    awardedPoints: report.awarded_points ?? 0,
    reviewerComment: report.reviewer_comment ?? "",

    reviewedBy: report.reviewed_by ?? "",
    createdDate: report.created_date,
    reviewedDate: report.reviewed_date ?? "",
  }));

  console.log("MAPPED REPORTS:", mappedReports);

  setReportsState(mappedReports);
}

  }


  loadData();

}, []);
  const [announcementsState, setAnnouncementsState] = useState<Announcement[]>(getAnnouncements);
  const [documentsState, setDocumentsState] = useState<Document[]>(getDocuments);
  const [currentUser, setCurrentUser] = useState<User | null>(initUser);
  const [page, setPage] = useState<PageName>('dashboard');

  const setUsers = (u: User[]) => { saveUsers(u); setUsersState(u); };
  const setReports = (r: Report[]) => { saveReports(r); setReportsState(r); };
  const setAnnouncements = (a: Announcement[]) => { saveAnnouncements(a); setAnnouncementsState(a); };
  const setDocuments = (d: Document[]) => { saveDocuments(d); setDocumentsState(d); };

  async function login(
  email: string,
  password: string
): Promise<"ok" | "invalid" | "pending" | "inactive"> {
  try {
    const auth = await signIn(email, password);

    const userId = auth.user.id;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) return "invalid";

    if (profile.status === "pending") return "pending";
    if (profile.status === "inactive") return "inactive";

    setCurrentUser(profile);
    console.log("CURRENT PROFILE", profile);
    setSession(profile.id);
    setPage("dashboard");

    return "ok";
  } catch {
    return "invalid";
  }
}

  async function logout() {
  await signOut();
  setCurrentUser(null);
  clearSession();
}

  function register(data: Omit<User, 'id' | 'role' | 'points' | 'status' | 'createdAt'>) {
    const newUser: User = {
      ...data,
      id: generateId(),
      role: 'member',
      points: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setUsers([...usersState, newUser]);
  }

  async function updateUser(id: string, data: Partial<User>) {

  const updateData: any = {};

  if (data.points !== undefined) updateData.points = data.points;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.status !== undefined) updateData.status = data.status.toLowerCase();

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id);

   console.log("UPDATE DATA:", updateData);
console.log("UPDATE ERROR:", error);

  if (error) {
    console.error(error);
    return;
  }

  const updated = usersState.map(u =>
    u.id === id ? { ...u, ...data } : u
  );

  setUsersState(updated);

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

  async function submitReport(
  data: Pick<Report, 'authorId' | 'description' | 'photoUrl' | 'link'>
) {

  const newReport = {
    author_id: data.authorId,
    description: data.description,
    photo_url: data.photoUrl,
    link: data.link,

    status: 'pending',
    awarded_points: 0,
    reviewer_comment: '',
    created_date: new Date().toISOString(),
  };


  const { data: report, error } = await supabase
    .from("reports")
    .insert(newReport)
    .select()
    .single();


  if (error) {
    console.error("REPORT INSERT ERROR:", error);
    return;
  }


 if (report) {

  const mappedReport = {
    id: report.id,
    authorId: report.author_id,
    description: report.description,
    photoUrl: report.photo_url,
    link: report.link,

    status: report.status,

    awardedPoints: report.awarded_points ?? 0,
    reviewerComment: report.reviewer_comment ?? "",

    reviewedBy: report.reviewed_by ?? "",
    createdDate: report.created_date,
    reviewedDate: report.reviewed_date ?? "",
  };

  setReportsState(prev => [mappedReport, ...prev]);
}

}

  async function reviewReport(
  id: string,
  status: "approved" | "rejected",
  comment: string,
  points: number
) {

  // Знаходимо репорт
  const report = reportsState.find(r => r.id === id);
  if (!report) return;

  // Оновлюємо репорт у Supabase
  const { data, error } = await supabase
    .from("reports")
    .update({
      status: status.toLowerCase(),
      reviewer_comment: comment,
      awarded_points: status === "approved" ? points : 0,
      reviewed_by: currentUser?.id,
      reviewed_date: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("REPORT UPDATE ERROR:", error);
    return;
  }

  // Оновлюємо локальний список репортів
  setReportsState(prev =>
    prev.map(r =>
      r.id === id
        ? {
            ...r,
            status: data.status,
            reviewerComment: data.reviewer_comment,
            reviewedBy: data.reviewed_by,
            awardedPoints: data.awarded_points,
            reviewedDate: data.reviewed_date,
          }
        : r
    )
  );

  // Якщо схвалили — додаємо бали автору
  if (status === "approved") {

    console.log("APPROVE BLOCK");

    const author = usersState.find(u => u.id === report.authorId);

    console.log("REPORT:", report);
    console.log("AUTHOR:", author);

    if (author) {

    console.log("AUTHOR:", author);
    console.log("POINTS BEFORE:", author?.points);
    console.log("ADDING:", points);

      await updateUser(author.id, {
        points: author.points + points,
      });
    console.log("UPDATE FINISHED");
      // Одразу оновлюємо список користувачів із Supabase
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*");

      if (usersData) {

        const mappedUsers = (usersData ?? []).map(profile => ({
  id: profile.id,

  email: profile.email ?? "",

  firstName: profile.first_name ?? "",
  lastName: profile.last_name ?? "",

  className: profile.class ?? "",

  phone: profile.phone_number ?? "",

  telegram: profile.telegram_username ?? "",

  structure: profile.structure ?? "Government",

  role: profile.role ?? "member",

  status: profile.status?.toLowerCase() ?? "active",

  points: profile.points ?? 0,

  createdAt: profile.created_at ?? "",
}));
        setUsersState(mappedUsers);
      }
    }
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
