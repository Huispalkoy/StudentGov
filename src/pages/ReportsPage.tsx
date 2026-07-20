import { useState } from 'react';
import { useApp } from '../context';
import { StatusBadge } from '../components/Badge';
import { Avatar } from '../components/Layout';
import { Modal, Field, Input, Textarea, Select, Btn } from '../components/Modal';
import { Icons } from '../icons';
import type { Report } from '../types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReportsPage() {
  const { currentUser, reports, users, submitReport, reviewReport } = useApp();
  const isAdmin = currentUser?.role !== 'Member';

  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewing, setReviewing] = useState<Report | null>(null);
  const [viewing, setViewing] = useState<Report | null>(null);

  const myReports = [...reports]
    .filter(r => r.authorId === currentUser?.id)
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));

  const pendingForReview = [...reports]
    .filter(r => r.status === 'Pending')
    .sort((a, b) => a.createdDate.localeCompare(b.createdDate));

  const allReports = [...reports]
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin ? 'Review activity reports from all members' : 'Submit and track your activity reports'}
          </p>
        </div>
        <Btn onClick={() => setSubmitOpen(true)}>
          {Icons.plus} New Report
        </Btn>
      </div>

      {/* Admin: Pending reviews */}
      {isAdmin && pendingForReview.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-[15px] text-slate-900 mb-3 flex items-center gap-2">
            Pending Review
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-warning text-white text-[11px] font-bold">
              {pendingForReview.length}
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {pendingForReview.map(r => {
              const author = users.find(u => u.id === r.authorId);
              return (
                <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    {author && <Avatar name={author.fullName} size={36} />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[13px] text-slate-900">{author?.fullName ?? 'Unknown'}</span>
                        <span className="text-slate-400 text-[12px]">· {formatDate(r.createdDate)}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-slate-600 text-[13px] leading-relaxed line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {r.photoUrl && (
                          <a href={r.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-primary hover:underline">
                            {Icons.image} Photo
                          </a>
                        )}
                        {r.link && (
                          <a href={r.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-primary hover:underline">
                            {Icons.link} Link
                          </a>
                        )}
                      </div>
                    </div>
                    <Btn size="sm" onClick={() => setReviewing(r)}>
                      Review
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My reports */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-[15px] text-slate-900 mb-3">My Reports</h2>
        {myReports.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border py-12 text-center">
            <div className="flex justify-center text-slate-300 mb-3">{Icons.reports}</div>
            <p className="text-slate-400 text-[13px]">No reports yet. Submit your first activity report.</p>
            <Btn variant="secondary" size="sm" className="mt-4" onClick={() => setSubmitOpen(true)}>
              {Icons.plus} Submit Report
            </Btn>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myReports.map(r => (
              <ReportCard key={r.id} report={r} onView={() => setViewing(r)} />
            ))}
          </div>
        )}
      </div>

      {/* Admin: All reports history */}
      {isAdmin && (
        <div>
          <h2 className="font-display font-semibold text-[15px] text-slate-900 mb-3">All Reports</h2>
          <div className="flex flex-col gap-3">
            {allReports.map(r => {
              const author = users.find(u => u.id === r.authorId);
              return (
                <div key={r.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
                  {author && <Avatar name={author.fullName} size={32} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-slate-900">{author?.fullName}</span>
                      <span className="text-slate-400 text-[12px]">{formatDate(r.createdDate)}</span>
                    </div>
                    <p className="text-slate-500 text-[12px] line-clamp-1">{r.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={r.status} />
                    {r.status === 'Approved' && r.awardedPoints !== 0 && (
                      <span className="text-[12px] font-semibold text-warning">+{r.awardedPoints}pts</span>
                    )}
                    <button onClick={() => setViewing(r)} className="text-slate-400 hover:text-primary transition-colors">
                      {Icons.eye}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {submitOpen && (
        <SubmitReportModal
          authorId={currentUser?.id ?? ''}
          onClose={() => setSubmitOpen(false)}
          onSubmit={data => { submitReport(data); setSubmitOpen(false); }}
        />
      )}

      {reviewing && (
        <ReviewModal
          report={reviewing}
          author={users.find(u => u.id === reviewing.authorId)}
          onClose={() => setReviewing(null)}
          onReview={(id, status, comment, pts) => {
            reviewReport(id, status, comment, pts);
            setReviewing(null);
          }}
        />
      )}

      {viewing && (
        <ViewReportModal
          report={viewing}
          author={users.find(u => u.id === viewing.authorId)}
          reviewer={users.find(u => u.id === viewing.reviewedBy)}
          onClose={() => setViewing(null)}
          onReview={isAdmin && viewing.status === 'Pending' ? () => { setViewing(null); setReviewing(viewing); } : undefined}
        />
      )}
    </div>
  );
}

function ReportCard({ report, onView }: { report: Report; onView: () => void }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex gap-3 items-start">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          report.status === 'Approved'
            ? 'bg-success-bg text-success'
            : report.status === 'Rejected'
            ? 'bg-danger-bg text-danger'
            : 'bg-warning-bg text-warning'
        }`}
      >
        {report.status === 'Approved' ? Icons.check : report.status === 'Rejected' ? Icons.x : Icons.reports}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={report.status} />
          {report.status === 'Approved' && report.awardedPoints !== 0 && (
            <span className="text-[12px] font-semibold text-warning">+{report.awardedPoints} pts</span>
          )}
          <span className="text-slate-400 text-[11px]">{formatDate(report.createdDate)}</span>
        </div>
        <p className="text-slate-700 text-[13px] leading-relaxed line-clamp-2">{report.description}</p>
        {report.reviewerComment && (
          <p className="text-slate-400 text-[12px] mt-1 italic line-clamp-1">"{report.reviewerComment}"</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {report.photoUrl && (
            <a href={report.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-primary hover:underline">
              {Icons.image} Photo
            </a>
          )}
          {report.link && (
            <a href={report.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-primary hover:underline">
              {Icons.link} Link
            </a>
          )}
          <button onClick={onView} className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-primary ml-auto">
            {Icons.eye} Details
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmitReportModal({
  authorId, onClose, onSubmit,
}: {
  authorId: string;
  onClose: () => void;
  onSubmit: (data: Pick<Report, 'authorId' | 'description' | 'photoUrl' | 'link'>) => void;
}) {
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) { setError('Description is required.'); return; }
    onSubmit({ authorId, description: description.trim(), photoUrl: photoUrl.trim(), link: link.trim() });
  }

  return (
    <Modal title="Submit Activity Report" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Description" required hint="Describe the activity, your role, and the impact.">
          <Textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setError(''); }}
            placeholder="Describe what you did, how many people were involved, and the outcome…"
            rows={5}
            error={error}
          />
          {error && <p className="text-[12px] text-danger">{error}</p>}
        </Field>
        <Field label="Photo URL" hint="Link to a photo from the activity (optional).">
          <Input
            value={photoUrl}
            onChange={e => setPhotoUrl(e.target.value)}
            placeholder="https://…"
            type="url"
          />
        </Field>
        <Field label="Reference Link" hint="Link to a post, article, or document (optional).">
          <Input
            value={link}
            onChange={e => setLink(e.target.value)}
            placeholder="https://…"
            type="url"
          />
        </Field>
        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" className="flex-1">Submit Report</Btn>
        </div>
      </form>
    </Modal>
  );
}

function ReviewModal({
  report, author, onClose, onReview,
}: {
  report: Report;
  author?: { fullName: string };
  onClose: () => void;
  onReview: (id: string, status: 'Approved' | 'Rejected', comment: string, pts: number) => void;
}) {
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [comment, setComment] = useState('');
  const [points, setPoints] = useState(10);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onReview(report.id, decision, comment.trim(), decision === 'Approved' ? points : 0);
  }

  return (
    <Modal title="Review Report" onClose={onClose} width="max-w-xl">
      <div className="flex flex-col gap-5">
        {/* Report preview */}
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            {author && <Avatar name={author.fullName} size={24} />}
            <span className="font-medium text-[13px] text-slate-900">{author?.fullName}</span>
            <span className="text-slate-400 text-[12px]">· {formatDate(report.createdDate)}</span>
          </div>
          <p className="text-slate-700 text-[13px] leading-relaxed">{report.description}</p>
          {report.photoUrl && (
            <div className="mt-1">
              <img
                src={report.photoUrl}
                alt="Report photo"
                className="rounded-lg max-h-40 object-cover w-full bg-slate-200"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
          <div className="flex gap-3 mt-1">
            {report.photoUrl && (
              <a href={report.photoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-primary hover:underline">
                {Icons.image} Photo
              </a>
            )}
            {report.link && (
              <a href={report.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-primary hover:underline">
                {Icons.link} Link
              </a>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Decision" required>
            <Select value={decision} onChange={e => setDecision(e.target.value as 'Approved' | 'Rejected')}>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </Field>

          {decision === 'Approved' && (
            <Field label="Award Points">
              <Input
                type="number"
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
                min={0}
                max={100}
              />
            </Field>
          )}

          <Field label="Comment" hint="Optional feedback for the member.">
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Leave a comment for the member…"
              rows={3}
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <Btn type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
            <Btn
              type="submit"
              className="flex-1"
              variant={decision === 'Approved' ? 'primary' : 'danger'}
            >
              {decision === 'Approved' ? `Approve (+${points}pts)` : 'Reject'}
            </Btn>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function ViewReportModal({
  report, author, reviewer, onClose, onReview,
}: {
  report: Report;
  author?: { fullName: string };
  reviewer?: { fullName: string };
  onClose: () => void;
  onReview?: () => void;
}) {
  return (
    <Modal title="Report Details" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {author && <Avatar name={author.fullName} size={28} />}
          <div>
            <span className="font-medium text-[13px] text-slate-900">{author?.fullName}</span>
            <span className="text-slate-400 text-[12px] ml-2">{formatDate(report.createdDate)}</span>
          </div>
          <div className="ml-auto"><StatusBadge status={report.status} /></div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Description</div>
          <p className="text-[14px] text-slate-700 leading-relaxed">{report.description}</p>
        </div>

        {report.photoUrl && (
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Photo</div>
            <img
              src={report.photoUrl}
              alt="Report"
              className="rounded-xl max-h-48 object-cover w-full bg-slate-200"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <a href={report.photoUrl} target="_blank" rel="noreferrer" className="text-[12px] text-primary hover:underline flex items-center gap-1 mt-1">
              {Icons.link} Open photo
            </a>
          </div>
        )}

        {report.link && (
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Reference</div>
            <a href={report.link} target="_blank" rel="noreferrer" className="text-[13px] text-primary hover:underline break-all">
              {report.link}
            </a>
          </div>
        )}

        {report.status !== 'Pending' && (
          <div className={`rounded-xl p-3 ${report.status === 'Approved' ? 'bg-success-bg' : 'bg-danger-bg'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[12px] font-semibold ${report.status === 'Approved' ? 'text-success' : 'text-danger'}`}>
                {report.status} by {reviewer?.fullName ?? 'Unknown'}
              </span>
              {report.status === 'Approved' && report.awardedPoints !== 0 && (
                <span className="text-warning text-[13px] font-bold">+{report.awardedPoints} pts</span>
              )}
            </div>
            {report.reviewerComment && (
              <p className={`text-[13px] ${report.status === 'Approved' ? 'text-success' : 'text-danger'} opacity-80`}>
                "{report.reviewerComment}"
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Close</Btn>
          {onReview && (
            <Btn className="flex-1" onClick={onReview}>Review</Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}
