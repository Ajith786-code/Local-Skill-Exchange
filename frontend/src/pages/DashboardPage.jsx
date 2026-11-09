import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Compass, Inbox, Pencil, Sparkles, GraduationCap, BookOpen, CheckCircle2, Users } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { CardGridSkeleton } from '../components/common/Skeleton';
import MatchCard from '../components/matches/MatchCard';
import NotificationItem from '../components/notifications/NotificationItem';
import SendRequestModal from '../components/requests/SendRequestModal';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as dashboardApi from '../api/dashboardApi';
import * as notificationApi from '../api/notificationApi';

function StatCard({ icon: Icon, label, value, to }) {
  return (
    <Link to={to} className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
      <span>
        <span className="block text-2xl font-bold text-slate-900">{value}</span>
        <span className="block text-sm text-slate-500">{label}</span>
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setUnreadCount } = useNotifications();
  const { data, loading, error, reload } = useFetch(() => dashboardApi.getDashboard(), []);
  const [target, setTarget] = useState(null);
  const [preferred, setPreferred] = useState(null);

  const openNotification = async (n) => {
    if (!n.read) {
      try {
        const res = await notificationApi.markRead(n.id);
        setUnreadCount(res.unreadCount);
      } catch {
        /* navigation still works */
      }
    }
    navigate(n.link || '/notifications');
  };

  const actions = [
    { to: '/profile/edit', label: 'Edit profile', icon: Pencil },
    { to: '/discover', label: 'Find skills', icon: Compass },
    { to: '/matches', label: 'View matches', icon: Sparkles },
    { to: '/requests', label: 'View requests', icon: Inbox },
  ];

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}!`} subtitle="Here is what is happening with your skill exchanges." />
      {loading && !data ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <div className="space-y-8">
          <section aria-label="Quick actions" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {actions.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="btn-secondary justify-start py-3"><Icon className="h-4 w-4 text-brand-600" aria-hidden="true" /> {label}</Link>
            ))}
          </section>

          <section aria-label="Statistics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={GraduationCap} label="Skills you offer" value={data.stats.offeredSkills} to="/profile" />
            <StatCard icon={BookOpen} label="Skills you want" value={data.stats.wantedSkills} to="/profile" />
            <StatCard icon={Users} label="Mutual matches" value={data.stats.mutualMatches} to="/matches" />
            <StatCard icon={Inbox} label="Pending incoming requests" value={data.stats.pendingIncoming} to="/requests?status=pending" />
            <StatCard icon={CheckCircle2} label="Accepted exchanges" value={data.stats.acceptedExchanges} to="/requests?status=accepted" />
            <StatCard icon={Bell} label="Unread notifications" value={data.stats.unreadNotifications} to="/notifications" />
          </section>

          {data.profileCompletion.percent < 100 && (
            <section className="card p-5" aria-label="Profile completion">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Profile completion</h2>
                <span className="text-sm font-semibold text-brand-700">{data.profileCompletion.percent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={data.profileCompletion.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${data.profileCompletion.percent}%` }} />
              </div>
              <ul className="mt-3 list-inside list-disc text-sm text-slate-600">
                {data.profileCompletion.missing.map((m) => <li key={m.key}>{m.label}</li>)}
              </ul>
              <Link to="/profile/edit" className="btn-primary btn-sm mt-4">Complete your profile</Link>
            </section>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <section aria-label="Suggested matches">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Suggested matches</h2>
                <Link to="/matches" className="text-sm font-medium text-brand-700 hover:underline">See all</Link>
              </div>
              {data.suggestedMatches.length === 0 ? (
                <EmptyState icon={Sparkles} title="No mutual matches yet" description="Add skills you can teach and skills you want to learn so we can find people to swap with." actionLabel="Update my skills" actionTo="/profile/edit" />
              ) : (
                <div className="space-y-4">
                  {data.suggestedMatches.map((m) => (
                    <MatchCard key={m.user.id} match={m} compact onRequest={(u, match) => { setTarget(u); setPreferred(match); }} />
                  ))}
                </div>
              )}
            </section>

            <section aria-label="Recent notifications">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent notifications</h2>
                <Link to="/notifications" className="text-sm font-medium text-brand-700 hover:underline">See all</Link>
              </div>
              {data.recentNotifications.length === 0 ? (
                <EmptyState icon={Bell} title="Nothing new" description="You will be notified here about requests, acceptances and messages." />
              ) : (
                <ul className="space-y-2">
                  {data.recentNotifications.map((n) => <NotificationItem key={n.id} notification={n} onOpen={openNotification} />)}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
      <SendRequestModal target={target} preferred={preferred} onClose={() => setTarget(null)} onSent={reload} />
    </>
  );
}
