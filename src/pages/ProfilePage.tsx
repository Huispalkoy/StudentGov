import { useState } from 'react';
import { useApp } from '../context';
import { Avatar } from '../components/Layout';
import { StatusBadge, RoleBadge, StructureBadge } from '../components/Badge';
import { Modal, Field, Input, Select, Btn } from '../components/Modal';
import type { UserRole, UserStatus, UserStructure } from '../types';

export default function ProfilePage() {
  const { currentUser, updateUser, reports } = useApp();
  const [editing, setEditing] = useState(false);
  const isAdmin = currentUser?.role === 'President';

  const myReports = reports.filter(r => r.authorId === currentUser?.id);
  const approved = myReports.filter(r => r.status === 'Approved').length;
  const pending = myReports.filter(r => r.status === 'Pending').length;

  if (!currentUser) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl text-slate-900 mb-6">My Profile</h1>

      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
        <div
          className="h-24 relative"
          style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)' }}
        />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <Avatar name={currentUser.fullName} size={72} className="ring-4 ring-white" />
            <Btn variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit Profile
            </Btn>
          </div>

          <h2 className="font-display font-bold text-xl text-slate-900">{currentUser.fullName}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <RoleBadge role={currentUser.role} />
            <StructureBadge structure={currentUser.structure} />
            <StatusBadge status={currentUser.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <ProfileField label="Class" value={currentUser.class} />
            <ProfileField label="Email" value={currentUser.email} />
            <ProfileField label="Phone" value={currentUser.phoneNumber || '—'} />
            <ProfileField label="Telegram" value={currentUser.telegramUsername || '—'} />
            <ProfileField label="Structure" value={currentUser.structure} />
            <ProfileField label="Member since" value={new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
          </div>
        </div>
      </div>

      {/* Points & stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <div className="font-display font-bold text-3xl text-warning">{currentUser.points}</div>
          <div className="text-slate-500 text-xs mt-1">Total Points</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <div className="font-display font-bold text-3xl text-primary">{myReports.length}</div>
          <div className="text-slate-500 text-xs mt-1">Reports</div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <div className="font-display font-bold text-3xl text-success">{approved}</div>
          <div className="text-slate-500 text-xs mt-1">Approved</div>
        </div>
      </div>

      {pending > 0 && (
        <div className="bg-warning-bg border border-warning/20 rounded-xl px-4 py-3 text-warning text-[13px]">
          You have {pending} report{pending !== 1 ? 's' : ''} pending review.
        </div>
      )}

      {editing && (
        <EditProfileModal
          user={currentUser}
          isAdmin={isAdmin}
          onClose={() => setEditing(false)}
          onSave={(data) => { updateUser(currentUser.id, data); setEditing(false); }}
        />
      )}
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-[14px] text-slate-800">{value}</div>
    </div>
  );
}

function EditProfileModal({
  user, isAdmin, onClose, onSave,
}: {
  user: NonNullable<ReturnType<typeof useApp>['currentUser']>;
  isAdmin: boolean;
  onClose: () => void;
  onSave: (data: {
    fullName: string; class: string; phoneNumber: string; telegramUsername: string;
    role?: UserRole; structure?: UserStructure; status?: UserStatus; points?: number;
  }) => void;
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

  function upd<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <Modal title="Edit Profile" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full Name" required>
          <Input value={form.fullName} onChange={e => upd('fullName', e.target.value)} required />
        </Field>
        <Field label="Class" required>
          <Input value={form.class} onChange={e => upd('class', e.target.value)} required />
        </Field>
        <Field label="Phone Number">
          <Input value={form.phoneNumber} onChange={e => upd('phoneNumber', e.target.value)} />
        </Field>
        <Field label="Telegram Username">
          <Input value={form.telegramUsername} onChange={e => upd('telegramUsername', e.target.value)} placeholder="@username" />
        </Field>

        {isAdmin && (
          <>
            <div className="h-px bg-border" />
            <p className="text-[12px] text-slate-400 font-medium uppercase tracking-wide">Admin Fields</p>
            <Field label="Role">
              <Select value={form.role} onChange={e => upd('role', e.target.value as UserRole)}>
                <option>Member</option>
                <option>Vice President</option>
                <option>President</option>
              </Select>
            </Field>
            <Field label="Structure">
              <Select value={form.structure} onChange={e => upd('structure', e.target.value as UserStructure)}>
                <option>Government</option>
                <option>Council of Class Presidents</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => upd('status', e.target.value as UserStatus)}>
                <option>Pending</option>
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            </Field>
            <Field label="Points">
              <Input type="number" value={form.points} onChange={e => upd('points', Number(e.target.value))} min={0} />
            </Field>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" className="flex-1">Save Changes</Btn>
        </div>
      </form>
    </Modal>
  );
}
