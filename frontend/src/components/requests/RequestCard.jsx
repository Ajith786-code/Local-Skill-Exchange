import { Link } from 'react-router-dom';
import { ArrowLeftRight, Ban, Check, CheckCircle2, MessageSquare, X } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatDateTime } from '../../utils/formatters';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-200 text-slate-700',
  completed: 'bg-brand-100 text-brand-800',
};

export default function RequestCard({ request, currentUserId, busy, onAction }) {
  const isSender = request.role === 'sender';
  const partner = isSender ? request.receiver : request.sender;
  const mySkill = isSender ? request.offeredSkill : request.requestedSkill;
  const theirSkill = isSender ? request.requestedSkill : request.offeredSkill;
  const iCompleted = request.completedBy.includes(currentUserId);
  const partnerCompleted = request.completedBy.length > 0 && !iCompleted;

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-start gap-3">
        <Avatar name={partner.name} src={partner.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/users/${partner.id}`} className="truncate text-base font-semibold text-slate-900 hover:text-brand-700">{partner.name}</Link>
            <span className={`badge capitalize ${STATUS_STYLES[request.status]}`}>{request.status}</span>
            <span className="badge bg-slate-100 text-slate-600">{isSender ? 'Sent by you' : 'Received'}</span>
          </div>
          <p className="text-sm text-slate-500">{partner.city}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm">
        <span>You teach <strong className="text-brand-700">{mySkill}</strong></span>
        <ArrowLeftRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <span>You learn <strong className="text-amber-700">{theirSkill}</strong></span>
      </div>

      {request.message && <p className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-slate-200 p-3 text-sm text-slate-600">“{request.message}”</p>}

      <p className="mt-3 text-xs text-slate-500">
        Sent {formatDateTime(request.createdAt)}
        {request.updatedAt !== request.createdAt && <> · Updated {formatDateTime(request.updatedAt)}</>}
      </p>

      {request.status === 'accepted' && (iCompleted || partnerCompleted) && (
        <p className="mt-2 text-sm text-emerald-700">
          {iCompleted ? `You marked this as completed. Waiting for ${partner.name} to confirm.` : `${partner.name} marked this as completed. Confirm to finish.`}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {request.status === 'pending' && !isSender && (
          <>
            <button type="button" className="btn-primary btn-sm" disabled={busy} onClick={() => onAction('accept', request)}>
              <Check className="h-4 w-4" aria-hidden="true" /> Accept
            </button>
            <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => onAction('reject', request)}>
              <X className="h-4 w-4" aria-hidden="true" /> Reject
            </button>
          </>
        )}
        {request.status === 'pending' && isSender && (
          <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => onAction('cancel', request)}>
            <Ban className="h-4 w-4" aria-hidden="true" /> Cancel request
          </button>
        )}
        {request.status === 'accepted' && (
          <>
            <Link to={`/messages/${request.id}`} className="btn-primary btn-sm">
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> Open chat
            </Link>
            {!iCompleted && (
              <button type="button" className="btn-secondary btn-sm" disabled={busy} onClick={() => onAction('complete', request)}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Mark as completed
              </button>
            )}
          </>
        )}
        {request.status === 'completed' && (
          <Link to={`/messages/${request.id}`} className="btn-secondary btn-sm">
            <MessageSquare className="h-4 w-4" aria-hidden="true" /> View chat history
          </Link>
        )}
      </div>
    </article>
  );
}
