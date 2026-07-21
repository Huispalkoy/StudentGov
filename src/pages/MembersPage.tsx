import { useState } from 'react';
import { useApp } from '../context';
import { Avatar } from '../components/Layout';
import { RoleBadge, StructureBadge } from '../components/Badge';
import { Icons } from '../icons';
import type { User } from '../types';

export default function MembersPage() {
  const { users, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Government' | 'Council of Class Presidents'>('All');
  const [selected, setSelected] = useState<User | null>(null);

  const isAdmin = currentUser?.role !== 'member';
  const activeMembers = users.filter(u => u.status === 'active');

  const filtered = activeMembers.filter(u => {
    const matchSearch =
  `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
  u.className.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || u.structure === filter;
    return matchSearch && matchFilter;
  });

  // Sort: president first, then VP, then members; alphabetically within
  const sorted = [...filtered].sort((a, b) => {
    const order = { President: 0, 'vice_president': 1, Member: 2 };
    if (order[a.role] !== order[b.role]) return order[a.role] - order[b.role];
    return `${a.firstName} ${a.lastName}`.localeCompare(
  `${b.firstName} ${b.lastName}`
);
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Members</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search by name or class…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[14px] border border-border rounded-lg bg-card text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
          {(['All', 'Government', 'Council of Class Presidents'] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all whitespace-nowrap ${
                filter === opt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt === 'Council of Class Presidents' ? 'Class Presidents' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Members grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="mb-2">{Icons.members}</div>
          No members found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(u => (
            <MemberCard
              key={u.id}
              user={u}
              showPoints={isAdmin}
              onClick={isAdmin ? () => setSelected(u) : undefined}
            />
          ))}
        </div>
      )}

      {selected && isAdmin && (
        <MemberDetailModal
          user={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function MemberCard({
  user, showPoints, onClick,
}: {
  user: User; showPoints: boolean; onClick?: () => void;
}) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border p-4 flex gap-3 items-start transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}`}
      onClick={onClick}
    >
      <Avatar name={`${user.firstName} ${user.lastName}`} size={44} />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[14px] text-slate-900 truncate">
  {user.firstName} {user.lastName}
</div>
        <div className="text-slate-500 text-[12px] mt-0.5">
  Class {user.className}
</div>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <RoleBadge role={user.role} />
          <StructureBadge structure={user.structure} />
        </div>
        {showPoints && (
          <div className="mt-2 flex items-center gap-1 text-warning text-[12px] font-semibold">
            <span style={{ fontSize: 12 }}>{Icons.star}</span>
            {user.points} pts
          </div>
        )}
      </div>
    </div>
  );
}

function MemberDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm">
        <div
          className="h-20 rounded-t-2xl relative"
          style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)' }}
        />
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-4">
            <Avatar name={`${user.firstName} ${user.lastName}`} size={60} className="ring-4 ring-white" />
          </div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">{`${user.firstName} ${user.lastName}`}</h3>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                <RoleBadge role={user.role} />
                <StructureBadge structure={user.structure} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              {Icons.x}
            </button>
          </div>

          <div className="flex flex-col gap-2.5 text-[13px]">
            <Row label="Class" value={user.className} />
            <Row label="Phone" value={user.phone || '—'} />
            <Row label="Telegram" value={user.telegram || '—'} />
            <Row label="Email" value={user.email} />
            <Row label="Points" value={`${user.points} pts`} highlight />
            <Row
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${highlight ? 'text-warning' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}
