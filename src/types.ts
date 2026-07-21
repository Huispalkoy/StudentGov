export type UserRole = 'Member' | 'Vice President' | 'President';
export type UserStatus = 'Pending' | 'Active' | 'Inactive';
export type UserStructure = 'Government' | 'Council of Class Presidents';
export type ReportStatus = 'Pending' | 'Approved' | 'Rejected';
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
