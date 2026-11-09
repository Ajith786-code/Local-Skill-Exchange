import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import * as requestApi from '../../api/requestApi';
import { getErrorMessage } from '../../api/axios';

// Lets the user pick one of THEIR offered skills and one of the other person's offered skills.
export default function SendRequestModal({ target, preferred, onClose, onSent }) {
  const { user } = useAuth();
  const mine = user?.offeredSkills || [];
  const theirs = target?.offeredSkills || [];

  const [offered, setOffered] = useState('');
  const [requested, setRequested] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!target) return;
    const wantedByThem = new Set((target.wantedSkills || []).map((s) => s.normalized));
    const wantedByMe = new Set((user?.wantedSkills || []).map((s) => s.normalized));
    const bestMine = preferred?.youCanTeachThem?.[0] || mine.find((s) => wantedByThem.has(s.normalized)) || mine[0];
    const bestTheirs = preferred?.theyCanTeachYou?.[0] || theirs.find((s) => wantedByMe.has(s.normalized)) || theirs[0];
    setOffered(bestMine?.name || '');
    setRequested(bestTheirs?.name || '');
    setMessage('');
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (!target) return null;
  const cannotSend = mine.length === 0 || theirs.length === 0;

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const data = await requestApi.createRequest({
        receiverId: target.id,
        offeredSkill: offered,
        requestedSkill: requested,
        message: message.trim() || undefined,
      });
      toast.success(`Request sent to ${target.name}`);
      onSent?.(data.request);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Exchange skills with ${target.name}`}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="send-request-form" className="btn-primary" disabled={sending || cannotSend}>
            {sending ? 'Sending...' : 'Send request'}
          </button>
        </>
      }
    >
      {mine.length === 0 ? (
        <p className="text-sm text-slate-600">
          You have not listed a skill you can teach yet. <Link to="/profile/edit" className="font-medium text-brand-700 underline" onClick={onClose}>Add one to your profile</Link> first.
        </p>
      ) : theirs.length === 0 ? (
        <p className="text-sm text-slate-600">{target.name} has not listed any skills to teach yet.</p>
      ) : (
        <form id="send-request-form" onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="req-offered" className="label">I will teach</label>
            <select id="req-offered" className="input" value={offered} onChange={(e) => setOffered(e.target.value)} required>
              {mine.map((s) => <option key={s.normalized} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="req-requested" className="label">I want to learn</label>
            <select id="req-requested" className="input" value={requested} onChange={(e) => setRequested(e.target.value)} required>
              {theirs.map((s) => <option key={s.normalized} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="req-message" className="label">Message (optional)</label>
            <textarea id="req-message" className="input min-h-[90px]" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say hello and suggest when you could meet..." />
            <p className="mt-1 text-right text-xs text-slate-400">{message.length}/500</p>
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </form>
      )}
    </Modal>
  );
}
