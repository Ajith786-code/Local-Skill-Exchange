import { Link } from 'react-router-dom';
import { Clock, MapPin, Send } from 'lucide-react';
import Avatar from '../common/Avatar';
import SkillBadge from '../skills/SkillBadge';
import { modeLabel } from '../../utils/constants';

const MAX = 4;

function SkillRow({ label, skills, variant, highlight }) {
  if (!skills.length) return null;
  const matched = new Set(highlight.map((s) => s.normalized));
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, MAX).map((s) => (
          <SkillBadge key={s.normalized} skill={s} variant={matched.has(s.normalized) ? 'match' : variant} />
        ))}
        {skills.length > MAX && <span className="badge bg-slate-100 text-slate-600">+{skills.length - MAX} more</span>}
      </div>
    </div>
  );
}

// Used in search results. `user.overlap` (from the API) highlights skills that match the viewer's profile.
export default function ProfileCard({ user, onRequest }) {
  const overlap = user.overlap || { theyCanTeachYou: [], youCanTeachThem: [], isMutual: false };
  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start gap-3">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900">{user.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {user.city}
          </p>
        </div>
        {overlap.isMutual && <span className="badge bg-emerald-100 text-emerald-800">Mutual match</span>}
      </div>

      {user.bio && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{user.bio}</p>}

      <div className="mt-4 space-y-3">
        <SkillRow label="Can teach" skills={user.offeredSkills} variant="offered" highlight={overlap.theyCanTeachYou} />
        <SkillRow label="Wants to learn" skills={user.wantedSkills} variant="wanted" highlight={overlap.youCanTeachThem} />
      </div>

      <p className="mt-4 flex items-center gap-1 text-xs text-slate-500">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {modeLabel(user.learningMode)}
      </p>

      <div className="mt-auto flex gap-2 pt-4">
        <Link to={`/users/${user.id}`} className="btn-secondary flex-1">View profile</Link>
        {onRequest && (
          <button type="button" className="btn-primary flex-1" onClick={() => onRequest(user)}>
            <Send className="h-4 w-4" aria-hidden="true" /> Request
          </button>
        )}
      </div>
    </article>
  );
}
