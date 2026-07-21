export type UserRole = 'member' | 'vice_president' | 'president'  | 'candidate';
export type UserStatus = 'pending' | 'active' | 'inactive'| 'blocked';
structure:
 profile.structure === "Council of Class Presidents"
 ? "Council of Class Presidents"
 : "Government";
export type ReportStatus = 'pending' | 'approved' | 'rejected';
export type PageName = 'dashboard' | 'profile' | 'members' | 'information' | 'reports' | 'admin';

export interface User {
  id: string;

  email: string;

  firstName: string;
  lastName: string;

  className: string;

  phone: string;

  telegram: string;

  structure: UserStructure;

  role: UserRole;

  status: UserStatus;

  points: number;

  createdAt: string;
}

export interface Report {
  id: string;
  authorId: string;
  description: string;
  photoUrl: string;
  link: string;
  status: ReportStatus;
  awardedPoints: number;
  reviewerComment: string;
  reviewedBy: string;
  createdDate: string;
  reviewedDate: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdDate: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  createdDate: string;
}
