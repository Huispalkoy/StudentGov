import { useState } from 'react';
import { useApp } from '../context';
import { Avatar } from '../components/Layout';
import { StatusBadge, RoleBadge, StructureBadge } from '../components/Badge';
import { Modal, Field, Input, Select, Btn } from '../components/Modal';
import { Icons } from '../icons';
import type { User, UserRole, UserStatus, UserStructure } from '../types';

type Tab = 'applications' | 'members' | 'reports';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminPage() {
  const { users, reports, currentUser, approveUser, rejectUser, updateUser } = useApp();
  const [tab, setTab] = useState<Tab>('applications');
  const [editing, setEditing] = useState<User | null>(null);

  const pending = users.filter(u => u.status === 'Pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const activeMembers = users.filter(u => u.status === 'Active').sort((a, b) => a.fullName.localeCompare(b.fullName));

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'applications', label: 'Applications', count: pending.length },
    { id: 'members', label: 'Members', count: activeMembers.length },
    { id: 'reports', label: 'Reports', count: reports.filter(r => r.status === 'Pending').length },
  ];

  const isPresident = currentUser?.role === 'President';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-900">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {isPresident ? 'Full administrative access' : 'Report review access'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            disabled={!isPresident && t.id !== 'reports'}
            className={`relative px-4 py-2 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications */}
      {tab === 'applications' && (
        <div>
          {pending.length === 0 ? (
            <EmptyState icon={Icons.check} message="No pending applications." />
          ) : (
            <div className="flex flex-col gap-3">
              {pending.map(u => (
                <div key={u.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
                  <Avatar name={u.fullName} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-slate-900">{u.fullName}</div>
                    <div className="text-slate-500 text-[12px] mt-0.5">
                      Class {u.class} · {u.email} · Applied {formatDate(u.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <StructureBadge structure={u.structure} />
                      {u.phoneNumber && <span className="text-slate-400 text-[12px]">{u.phoneNumber}</span>}
                      {u.telegramUsername && <span className="text-slate-400 text-[12px]">{u.telegramUsername}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Btn
                      variant="danger"
                      size="sm"
                      onClick={() => rejectUser(u.id)}
                    >
                      {Icons.x} Reject
                    </Btn>
                    <Btn
                      size="sm"
                      onClick={() => approveUser(u.id)}
                    >
                      {Icons.check} Approve
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members management */}
      {tab === 'members' && (
        <div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Member</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Class</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Structure</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Points</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeMembers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.fullName} size={30} />
                        <div>
                          <div className="font-medium text-slate-900">{u.fullName}</div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.class}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3"><StructureBadge structure={u.structure} /></td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3 text-right font-semibold text-warning">{u.points}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(u)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary-light transition-colors ml-auto"
                      >
                        {Icons.edit}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports overview */}
      {tab === 'reports' && (
        <ReportsAdmin />
      )}

      {editing && (
        <EditMemberModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(id, data) => { updateUser(id, data); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ReportsAdmin() {
  const { reports, users } = useApp();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const filtered = reports
    .filter(r => filter === 'All' || r.status === filter)
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));

  const counts = {
    All: reports.length,
    Pending: reports.filter(r => r.status === 'Pending').length,
    Approved: reports.filter(r => r.status === 'Approved').length,
    Rejected: reports.filter(r => r.status === 'Rejected').length,
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium border transition-all ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-card text-slate-600 border-border hover:border-primary/30'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && <EmptyState icon={Icons.reports} message="No reports found." />}
        {filtered.map(r => {
          const author = users.find(u => u.id === r.authorId);
          const reviewer = users.find(u => u.id === r.reviewedBy);
          return (
            <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                {author && <Avatar name={author.fullName} size={34} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-[13px] text-slate-900">{author?.fullName}</span>
                    <span className="text-slate-400 text-[11px]">{formatDate(r.createdDate)}</span>
                    <StatusBadge status={r.status} />
                    {r.status === 'Approved' && r.awardedPoints !== 0 && (
                      <span className="text-warning text-[12px] font-semibold">+{r.awardedPoints}pts</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[13px] leading-relaxed">{r.description}</p>
                  {r.reviewerComment && (
                    <p className="text-slate-400 text-[12px] mt-1 italic">Reviewed by {reviewer?.fullName}: "{r.reviewerComment}"</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="text-center py-16 text-slate-400">
      <div className="flex justify-center mb-2">{icon}</div>
      {message}
    </div>
  );
}

function EditMemberModal({
  user, onClose, onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (id: string, data: Partial<User>) => void;
}) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    class: user.class,
    phoneNumber: user.phoneNumber,
    telegramUsername: user.telegramUsername,
    role: user.role as UserRole,
    structure: user.structure as UserStructure,
    status: user.status as UserStatus,
    points: user.points,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(user.id, form);
  }

  return (
    <Modal title={`Edit — ${user.fullName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <Input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          </Field>
          <Field label="Class" required>
            <Input value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} required />
          </Field>
          <Field label="Phone">
            <Input value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
          </Field>
          <Field label="Telegram">
            <Input value={form.telegramUsername} onChange={e => setForm(f => ({ ...f, telegramUsername: e.target.value }))} placeholder="@username" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
              <option>Member</option>
              <option>Vice President</option>
              <option>President</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as UserStatus }))}>
              <option>Pending</option>
              <option>Active</option>
              <option>Inactive</option>
            </Select>
          </Field>
        </div>

        <Field label="Structure">
          <Select value={form.structure} onChange={e => setForm(f => ({ ...f, structure: e.target.value as UserStructure }))}>
            <option>Government</option>
            <option>Council of Class Presidents</option>
          </Select>
        </Field>

        <Field label="Points">
          <Input
            type="number"
            value={form.points}
            onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
            min={0}
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" className="flex-1">Save Changes</Btn>
        </div>
      </form>
    </Modal>
  );
}
