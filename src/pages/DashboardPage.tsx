import { useApp } from '../context';
import { StatusBadge } from '../components/Badge';
import { Icons } from '../icons';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { currentUser, reports, announcements, users, setPage } = useApp();

  const myReports = reports.filter(r => r.authorId === currentUser?.id);
  const pendingReports = reports.filter(r => r.status === 'Pending');
  const approvedReports = myReports.filter(r => r.status === 'Approved');
  const pendingApplications = users.filter(u => u.status === 'Pending');
  const activeMembers = users.filter(u => u.status === 'Active');

  const isAdmin = currentUser?.role !== 'Member';
  const latestAnnouncements = [...announcements].sort((a, b) => b.createdDate.localeCompare(a.createdDate)).slice(0, 3);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm">{greeting()}</p>
        <h1 className="font-display font-bold text-2xl text-slate-900 mt-0.5">
          {currentUser?.fullName?.split(' ')[0] ?? currentUser?.firstName ?? "User"} 👋
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Your Points"
          value={currentUser?.points ?? 0}
          icon={Icons.star}
          color="text-warning"
          bg="bg-warning-bg"
          action={() => setPage('profile')}
        />
        <StatCard
          label="My Reports"
          value={myReports.length}
          icon={Icons.reports}
          color="text-primary"
          bg="bg-primary-light"
          action={() => setPage('reports')}
        />
        <StatCard
          label="Approved"
          value={approvedReports.length}
          icon={Icons.check}
          color="text-success"
          bg="bg-success-bg"
          action={() => setPage('reports')}
        />
        {isAdmin ? (
          <StatCard
            label="Pending Review"
            value={pendingReports.length}
            icon={Icons.eye}
            color="text-slate-600"
            bg="bg-slate-100"
            action={() => setPage('admin')}
          />
        ) : (
          <StatCard
            label="Active Members"
            value={activeMembers.length}
            icon={Icons.members}
            color="text-slate-600"
            bg="bg-slate-100"
            action={() => setPage('members')}
          />
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-[15px] text-slate-900">Recent Announcements</h2>
            <button onClick={() => setPage('information')} className="text-[13px] text-primary hover:underline font-medium">
              View all
            </button>
          </div>
          {latestAnnouncements.length === 0 ? (
            <p className="text-slate-400 text-sm">No announcements yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {latestAnnouncements.map(a => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    {Icons.megaphone}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-[14px] text-slate-900 leading-snug">{a.title}</div>
                    <p className="text-slate-500 text-[13px] mt-1 line-clamp-2 leading-relaxed">{a.content}</p>
                    <div className="text-slate-400 text-[11px] mt-1">{formatDate(a.createdDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          {/* Quick actions */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-display font-semibold text-[15px] text-slate-900 mb-3">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <QuickAction label="Submit a Report" icon={Icons.plus} onClick={() => setPage('reports')} />
              <QuickAction label="View Members" icon={Icons.members} onClick={() => setPage('members')} />
              <QuickAction label="Browse Documents" icon={Icons.document} onClick={() => setPage('information')} />
              {isAdmin && <QuickAction label="Admin Panel" icon={Icons.admin} onClick={() => setPage('admin')} highlight />}
            </div>
          </div>

          {/* My recent reports */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-[15px] text-slate-900">My Reports</h2>
              <button onClick={() => setPage('reports')} className="text-[12px] text-primary hover:underline">
                All
              </button>
            </div>
            {myReports.length === 0 ? (
              <p className="text-slate-400 text-[13px]">No reports submitted yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {myReports.slice(-3).reverse().map(r => (
                  <div key={r.id} className="flex items-start justify-between gap-2">
                    <p className="text-[13px] text-slate-700 leading-snug line-clamp-1">{r.description}</p>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin: pending applications */}
          {isAdmin && pendingApplications.length > 0 && (
            <div className="bg-warning-bg rounded-2xl border border-warning/20 p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <h2 className="font-display font-semibold text-[14px] text-warning">
                  {pendingApplications.length} pending application{pendingApplications.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <p className="text-[13px] text-warning/80 mb-3">New members are waiting for approval.</p>
              <button
                onClick={() => setPage('admin')}
                className="text-[13px] font-semibold text-warning hover:underline"
              >
                Review in Admin Panel →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, color, bg, action,
}: {
  label: string; value: number; icon: React.ReactNode; color: string; bg: string; action?: () => void;
}) {
  return (
    <button
      onClick={action}
      className="bg-card rounded-2xl border border-border p-4 text-left hover:shadow-md transition-shadow"
    >
      <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="font-display font-bold text-2xl text-slate-900">{value}</div>
      <div className="text-slate-500 text-[12px] mt-0.5">{label}</div>
    </button>
  );
}

function QuickAction({
  label, icon, onClick, highlight = false,
}: {
  label: string; icon: React.ReactNode; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left ${
        highlight
          ? 'bg-primary text-white hover:bg-primary-dark'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
