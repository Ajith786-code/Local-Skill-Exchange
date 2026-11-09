import { Link } from 'react-router-dom';
import { ArrowLeftRight, MapPin, Send } from 'lucide-react';
import Avatar from '../common/Avatar';
import SkillBadge from '../skills/SkillBadge';

export default function MatchCard({ match, onRequest, compact = false }) {
  const { user, theyCanTeachYou, youCanTeachThem } = match;
  return (
    <article className="card p-5">
      <div className="flex items-center gap-3">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900">{user.name}</h3>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {user.city}
          </p>
        </div>
        <span className="badge bg-emerald-100 text-emerald-800">Mutual match</span>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{user.name.split(' ')[0]} teaches you</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {theyCanTeachYou.map((s) => <SkillBadge key={s.normalized} skill={s} variant="match" showLevel />)}
          </div>
        </div>
        <ArrowLeftRight className="mx-auto hidden h-5 w-5 text-slate-400 sm:block" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">You teach {user.name.split(' ')[0]}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {youCanTeachThem.map((s) => <SkillBadge key={s.normalized} skill={s} variant="match" showLevel />)}
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Offers</p>
            <div className="flex flex-wrap gap-1.5">
              {user.offeredSkills.map((s) => <SkillBadge key={s.normalized} skill={s} variant="offered" />)}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Wants</p>
            <div className="flex flex-wrap gap-1.5">
              {user.wantedSkills.map((s) => <SkillBadge key={s.normalized} skill={s} variant="wanted" />)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link to={`/users/${user.id}`} className="btn-secondary flex-1">View profile</Link>
        <button type="button" className="btn-primary flex-1" onClick={() => onRequest(user, match)}>
          <Send className="h-4 w-4" aria-hidden="true" /> Send request
        </button>
      </div>
    </article>
  );
}
