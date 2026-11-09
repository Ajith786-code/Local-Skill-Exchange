import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeftRight, Clock, MapPin, Send } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SkillBadge from '../components/skills/SkillBadge';
import SendRequestModal from '../components/requests/SendRequestModal';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import * as matchApi from '../api/matchApi';
import { modeLabel } from '../utils/constants';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const [open, setOpen] = useState(false);
  const { data, loading, error, reload } = useFetch(() => (userId === me.id ? Promise.resolve(null) : matchApi.matchWithUser(userId)), [userId]);

  if (userId === me.id) return <Navigate to="/profile" replace />;
  if (loading && !data) return <LoadingSpinner label="Loading profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const { user, theyCanTeachYou, youCanTeachThem, isMutual } = data;
  const matched = (list) => new Set(list.map((s) => s.normalized));
  const theirMatched = matched(theyCanTeachYou);
  const myMatched = matched(youCanTeachThem);

  return (
    <>
      <div className="card p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar name={user.name} src={user.avatar} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              {isMutual && <span className="badge bg-emerald-100 text-emerald-800">Mutual match</span>}
            </div>
            <p className="mt-1 flex items-center gap-1 text-slate-600"><MapPin className="h-4 w-4" aria-hidden="true" /> {user.city}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><Clock className="h-4 w-4" aria-hidden="true" /> {modeLabel(user.learningMode)}{user.availability ? ` · ${user.availability}` : ''}</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => setOpen(true)}><Send className="h-4 w-4" aria-hidden="true" /> Send exchange request</button>
        </div>
        {user.bio && <p className="mt-5 whitespace-pre-wrap break-words text-slate-700">{user.bio}</p>}
      </div>

      {(theyCanTeachYou.length > 0 || youCanTeachThem.length > 0) && (
        <section className="card mt-6 p-5" aria-label="How you match">
          <h2 className="font-semibold text-slate-900">How you match</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{user.name.split(' ')[0]} can teach you</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{theyCanTeachYou.length ? theyCanTeachYou.map((s) => <SkillBadge key={s.normalized} skill={s} variant="match" showLevel />) : <span className="text-sm text-slate-400">Nothing you want yet</span>}</div>
            </div>
            <ArrowLeftRight className="mx-auto hidden h-5 w-5 text-slate-400 sm:block" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">You can teach {user.name.split(' ')[0]}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{youCanTeachThem.length ? youCanTeachThem.map((s) => <SkillBadge key={s.normalized} skill={s} variant="match" showLevel />) : <span className="text-sm text-slate-400">Nothing they want yet</span>}</div>
            </div>
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-5" aria-label="Skills offered">
          <h2 className="font-semibold text-slate-900">Can teach</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.offeredSkills.length ? user.offeredSkills.map((s) => <SkillBadge key={s.normalized} skill={s} variant={theirMatched.has(s.normalized) ? 'match' : 'offered'} showLevel />) : <p className="text-sm text-slate-400">No skills listed.</p>}
          </div>
        </section>
        <section className="card p-5" aria-label="Skills wanted">
          <h2 className="font-semibold text-slate-900">Wants to learn</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.wantedSkills.length ? user.wantedSkills.map((s) => <SkillBadge key={s.normalized} skill={s} variant={myMatched.has(s.normalized) ? 'match' : 'wanted'} showLevel />) : <p className="text-sm text-slate-400">No skills listed.</p>}
          </div>
        </section>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">Contact details are private. After an exchange is accepted you can talk through <Link to="/messages" className="font-medium text-brand-700 underline">built-in chat</Link>.</p>

      <SendRequestModal target={open ? user : null} preferred={{ youCanTeachThem, theyCanTeachYou }} onClose={() => setOpen(false)} />
    </>
  );
}
