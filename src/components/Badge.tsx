import type { UserStatus, ReportStatus, UserRole } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const styles: Record<string, string> = {
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    danger: 'bg-danger-bg text-danger',
    info: 'bg-blue-50 text-blue-600',
    primary: 'bg-primary-light text-primary',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: UserStatus | ReportStatus }) {

  const map: Record<string, BadgeProps['variant']> = {
    active: "success",
    approved: "success",

    pending: "warning",

    rejected: "danger",

    inactive: "neutral",
    blocked: "danger",
  };

  const labels: Record<string, string> = {
    active: "Active",
    approved: "Approved",

    pending: "pending",

    rejected: "Rejected",

    inactive: "Inactive",
    blocked: "Blocked",
  };

  return (
    <Badge variant={map[status]}>
      {labels[status]}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, BadgeProps['variant']> = {
    president: 'primary',
    vice_president: 'info',
    member: 'neutral',
    candidate: 'warning',
  };

  const labels: Record<UserRole, string> = {
    president: 'President',
    vice_president: 'Vice President',
    member: 'Member',
    candidate: 'Candidate',
  };

  return (
    <Badge variant={map[role]}>
      {labels[role]}
    </Badge>
  );
}

export function StructureBadge({ structure }: { structure: string }) {
  return (
    <Badge variant={structure === 'Government' ? 'primary' : 'info'}>
      {structure === 'Government' ? 'Gov' : 'CCP'}
    </Badge>
  );
}
