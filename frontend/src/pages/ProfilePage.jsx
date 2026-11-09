import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Pencil } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Avatar from '../components/common/Avatar';
import SkillBadge from '../components/skills/SkillBadge';
import { useAuth } from '../context/AuthContext';
import { modeLabel } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="My profile" subtitle="This is how other members see you (your email stays private)." actions={<Link to="/profile/edit" className="btn-primary"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit profile</Link>} />
      <div className="card p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar name={user.name} src={user.avatar} size="xl" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-slate-600"><MapPin className="h-4 w-4" aria-hidden="true" /> {user.city}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><Mail className="h-4 w-4" aria-hidden="true" /> {user.email} <span className="text-xs">(only visible to you)</span></p>
          </div>
        </div>
        <p className="mt-5 whitespace-pre-wrap break-words text-slate-700">{user.bio || <span className="text-slate-400">You have not written a bio yet.</span>}</p>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="font-semibold text-slate-900">Preferred learning mode</dt><dd className="text-slate-600">{modeLabel(user.learningMode)}</dd></div>
          <div><dt className="flex items-center gap-1 font-semibold text-slate-900"><Clock className="h-4 w-4" aria-hidden="true" /> Availability</dt><dd className="text-slate-600">{user.availability || 'Not set'}</dd></div>
          <div><dt className="font-semibold text-slate-900">Member since</dt><dd className="text-slate-600">{formatDateTime(user.createdAt)}</dd></div>
        </dl>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card p-5" aria-label="Skills offered">
          <h3 className="font-semibold text-slate-900">Skills I can teach</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.offeredSkills.length ? user.offeredSkills.map((s) => <SkillBadge key={s.normalized} skill={s} variant="offered" showLevel />) : <p className="text-sm text-slate-400">None yet. <Link to="/profile/edit" className="text-brand-700 underline">Add a skill</Link></p>}
          </div>
        </section>
        <section className="card p-5" aria-label="Skills wanted">
          <h3 className="font-semibold text-slate-900">Skills I want to learn</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.wantedSkills.length ? user.wantedSkills.map((s) => <SkillBadge key={s.normalized} skill={s} variant="wanted" showLevel />) : <p className="text-sm text-slate-400">None yet. <Link to="/profile/edit" className="text-brand-700 underline">Add a skill</Link></p>}
          </div>
        </section>
      </div>
    </>
  );
}
