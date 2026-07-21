import type { ReactNode } from 'react';
import { useApp } from '../context';
import { Icons } from '../icons';
import type { PageName } from '../types';

interface NavItem {
  id: PageName;
  label: string;
  icon: ReactNode;
}

function Avatar({
  name,
  size = 32,
  className = "",
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  const safeName = (name ?? "").trim();

  const initials =
    safeName.length > 0
      ? safeName
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  const colors = [
    ["#DBEAFE", "#2563EB"],
    ["#D1FAE5", "#059669"],
    ["#FCE7F3", "#DB2777"],
    ["#FEF3C7", "#D97706"],
    ["#EDE9FE", "#7C3AED"],
    ["#FFEDD5", "#EA580C"],
  ];

  const idx =
    safeName.length > 0
      ? safeName.charCodeAt(0) % colors.length
      : 0;

  const [bg, fg] = colors[idx];

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0 font-display ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  );
}

export { Avatar };

export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser, page, setPage, logout } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'members', label: 'Members', icon: Icons.members },
    { id: 'information', label: 'Information', icon: Icons.information },
    { id: 'reports', label: 'Reports', icon: Icons.reports },
    ...(currentUser?.role !== 'Member'
      ? [{ id: 'admin' as PageName, label: 'Admin', icon: Icons.admin }]
      : []),
  ];

  const isAdmin = currentUser?.role !== 'Member';

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-card border-r border-border shrink-0">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              {Icons.logo}
            </div>
            <div>
              <div className="font-display font-bold text-[15px] text-slate-900 leading-none">StudentGov</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Student Council</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {navItems.map(item => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === 'admin' && isAdmin && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-warning" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 pb-4 flex flex-col gap-0.5">
          <div className="h-px bg-border mb-2" />
          <button
            onClick={() => setPage('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
              page === 'profile'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Avatar name={`${currentUser?.first_name ?? ""} ${currentUser?.last_name ?? ""}`} 
            size={22} />
            <div className="text-left min-w-0 flex-1">
              <div className={`truncate text-[13px] font-medium leading-tight ${page === 'profile' ? 'text-white' : 'text-slate-800'}`}>
                {`${currentUser?.first_name ?? ""} ${currentUser?.last_name ?? ""}`}
              </div>
              <div className={`text-[11px] leading-tight mt-0.5 ${page === 'profile' ? 'text-white/70' : 'text-slate-400'}`}>
                {currentUser?.role}
              </div>
            </div>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-slate-400 hover:text-danger hover:bg-danger-bg transition-all"
          >
            {Icons.logout}
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
              {Icons.logo}
            </div>
            <span className="font-display font-bold text-[15px] text-slate-900">StudentGov</span>
          </div>
          <button onClick={() => setPage('profile')}>
            <Avatar name={`${currentUser?.first_name ?? ""} ${currentUser?.last_name ?? ""}`}
  size={32} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-stretch border-t border-border bg-card shrink-0">
          {navItems.map(item => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
