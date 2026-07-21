import { useState } from 'react';
import { useApp } from '../context';
import { Avatar } from '../components/Layout';
import { RoleBadge } from '../components/Badge';
import { Modal, Field, Input, Textarea, Btn } from '../components/Modal';
import { Icons } from '../icons';
import type { Announcement } from '../types';

type Tab = 'announcements' | 'documents' | 'leadership';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InformationPage() {
  const { announcements, documents, users, currentUser, createAnnouncement, updateAnnouncement, deleteAnnouncement, createDocument, deleteDocument } = useApp();
  const [tab, setTab] = useState<Tab>('announcements');
  const [annoModal, setAnnoModal] = useState<'create' | Announcement | null>(null);
  const [docModal, setDocModal] = useState(false);

  const isAdmin = currentUser?.role !== 'Member';
  const sortedAnnouncements = [...announcements].sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  const sortedDocuments = [...documents].sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  const leadership = users.filter(u => u.status === 'Active' && u.role !== 'Member').sort((a) => {
    return a.role === 'president' ? -1 : 1;
  });
  const members = users.filter(u => u.status === 'Active' && u.role === 'Member');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'announcements', label: 'Announcements' },
    { id: 'documents', label: 'Documents' },
    { id: 'leadership', label: 'Leadership' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Information</h1>
          <p className="text-slate-500 text-sm mt-0.5">Announcements, documents, and leadership</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && tab === 'announcements' && (
            <Btn size="sm" onClick={() => setAnnoModal('create')}>
              {Icons.plus} New
            </Btn>
          )}
          {isAdmin && tab === 'documents' && (
            <Btn size="sm" onClick={() => setDocModal(true)}>
              {Icons.plus} Upload
            </Btn>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 self-start w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Announcements */}
      {tab === 'announcements' && (
        <div className="flex flex-col gap-4">
          {sortedAnnouncements.length === 0 && (
            <EmptyState icon={Icons.megaphone} message="No announcements yet." />
          )}
          {sortedAnnouncements.map(a => {
            const author = users.find(u => u.id === a.authorId);
            return (
              <div key={a.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-[15px] text-slate-900">{a.title}</h3>
                    <p className="text-slate-500 text-[13px] mt-2 leading-relaxed whitespace-pre-line">{a.content}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setAnnoModal(a)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary-light transition-colors"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(a.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-danger hover:bg-danger-bg transition-colors"
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                  {author && <Avatar name={author.fullName} size={20} />}
                  <span className="text-[12px] text-slate-500">
                    {author?.fullName ?? 'Unknown'} · {formatDate(a.createdDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Documents */}
      {tab === 'documents' && (
        <div className="flex flex-col gap-3">
          {sortedDocuments.length === 0 && (
            <EmptyState icon={Icons.document} message="No documents uploaded yet." />
          )}
          {sortedDocuments.map(d => (
            <div key={d.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                {Icons.document}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[14px] text-slate-900">{d.title}</div>
                <div className="text-slate-500 text-[12px] mt-0.5 line-clamp-1">{d.description}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{formatDate(d.createdDate)}</div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {d.fileUrl && d.fileUrl !== '#' ? (
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-primary-light text-primary text-[12px] font-medium hover:bg-blue-100 transition-colors"
                  >
                    Open
                  </a>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-[12px]">No link</span>
                )}
                {isAdmin && (
                  <button
                    onClick={() => deleteDocument(d.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-danger hover:bg-danger-bg transition-colors"
                  >
                    {Icons.trash}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leadership */}
      {tab === 'leadership' && (
        <div>
          <h2 className="font-display font-semibold text-[15px] text-slate-700 mb-3">Leadership</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {leadership.map(u => (
              <div key={u.id} className="bg-card rounded-2xl border border-border p-4 flex gap-3 items-center">
                <Avatar name={u.fullName} size={48} />
                <div>
                  <div className="font-semibold text-[14px] text-slate-900">{u.fullName}</div>
                  <div className="text-slate-400 text-[12px]">Class {u.class}</div>
                  <div className="mt-1.5"><RoleBadge role={u.role} /></div>
                </div>
              </div>
            ))}
            {leadership.length === 0 && (
              <p className="text-slate-400 text-sm col-span-2">No leadership members found.</p>
            )}
          </div>

          <h2 className="font-display font-semibold text-[15px] text-slate-700 mb-3">Members ({members.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map(u => (
              <div key={u.id} className="bg-card rounded-xl border border-border p-3 flex gap-2.5 items-center">
                <Avatar name={u.fullName} size={36} />
                <div className="min-w-0">
                  <div className="font-medium text-[13px] text-slate-900 truncate">{u.fullName}</div>
                  <div className="text-slate-400 text-[11px]">{u.class} · {u.structure === 'Government' ? 'Gov' : 'CCP'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcement modal */}
      {annoModal && (
        <AnnouncementModal
          existing={annoModal === 'create' ? null : annoModal}
          onClose={() => setAnnoModal(null)}
          onCreate={createAnnouncement}
          onUpdate={updateAnnouncement}
        />
      )}

      {/* Document modal */}
      {docModal && (
        <DocumentModal
          onClose={() => setDocModal(false)}
          onCreate={createDocument}
        />
      )}
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

function AnnouncementModal({
  existing, onClose, onCreate, onUpdate,
}: {
  existing: Announcement | null;
  onClose: () => void;
  onCreate: (title: string, content: string) => void;
  onUpdate: (id: string, data: Partial<Announcement>) => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (existing) onUpdate(existing.id, { title: title.trim(), content: content.trim() });
    else onCreate(title.trim(), content.trim());
    onClose();
  }

  return (
    <Modal title={existing ? 'Edit Announcement' : 'New Announcement'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title" required>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Monthly Meeting Reminder" required />
        </Field>
        <Field label="Content" required>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write the announcement content…"
            rows={5}
            required
          />
        </Field>
        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" className="flex-1">{existing ? 'Save Changes' : 'Publish'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

function DocumentModal({
  onClose, onCreate,
}: {
  onClose: () => void;
  onCreate: (title: string, description: string, fileUrl: string) => void;
}) {
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate(form.title.trim(), form.description.trim(), form.fileUrl.trim());
    onClose();
  }

  return (
    <Modal title="Add Document" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Title" required>
          <Input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Document title"
            required
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of the document"
            rows={3}
          />
        </Field>
        <Field label="File URL" hint="Paste a direct link to the file (Google Drive, OneDrive, etc.)">
          <Input
            value={form.fileUrl}
            onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
            placeholder="https://…"
            type="url"
          />
        </Field>
        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" className="flex-1">Add Document</Btn>
        </div>
      </form>
    </Modal>
  );
}
