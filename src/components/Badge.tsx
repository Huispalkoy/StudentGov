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
    Active: 'success',
    Approved: 'success',
    Pending: 'warning',
    Rejected: 'danger',
    Inactive: 'neutral',
  };
  return <Badge variant={map[status]}>{status}</Badge>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, BadgeProps['variant']> = {
    President: 'primary',
    'Vice President': 'info',
    Member: 'neutral',
  };
  return <Badge variant={map[role]}>{role}</Badge>;
}

export function StructureBadge({ structure }: { structure: string }) {
  return (
    <Badge variant={structure === 'Government' ? 'primary' : 'info'}>
      {structure === 'Government' ? 'Gov' : 'CCP'}
    </Badge>
  );
}
