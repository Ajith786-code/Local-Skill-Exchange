import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { CardGridSkeleton } from '../components/common/Skeleton';
import MatchCard from '../components/matches/MatchCard';
import SendRequestModal from '../components/requests/SendRequestModal';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import * as matchApi from '../api/matchApi';

export default function MatchesPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [preferred, setPreferred] = useState(null);
  const { data, loading, error, reload } = useFetch(() => matchApi.listMatches({ page, limit: 8 }), [page]);
  const missingSkills = user.offeredSkills.length === 0 || user.wantedSkills.length === 0;

  return (
    <>
      <PageHeader title="Your matches" subtitle="People who teach what you want to learn and want to learn what you teach." />
      {loading && !data ? (
        <CardGridSkeleton count={4} />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No mutual matches yet"
          description={missingSkills ? 'Add at least one skill you can teach and one you want to learn to be matched.' : 'Nobody matches right now. Browse members to find one-sided matches, or check back as more people join.'}
          actionLabel={missingSkills ? 'Update my skills' : 'Browse members'}
          actionTo={missingSkills ? '/profile/edit' : '/discover'}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.items.map((m) => <MatchCard key={m.user.id} match={m} onRequest={(u, match) => { setTarget(u); setPreferred(match); }} />)}
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
          <p className="mt-6 text-center text-sm text-slate-500">Looking for someone who only matches one way? Try <Link to="/discover" className="font-medium text-brand-700 underline">Find skills</Link>.</p>
        </>
      )}
      <SendRequestModal target={target} preferred={preferred} onClose={() => setTarget(null)} onSent={reload} />
    </>
  );
}
