import { useEffect, useMemo, useState } from 'react';
import { Compass, Search, X } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { CardGridSkeleton } from '../components/common/Skeleton';
import ProfileCard from '../components/profile/ProfileCard';
import SendRequestModal from '../components/requests/SendRequestModal';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import * as userApi from '../api/userApi';
import * as skillApi from '../api/skillApi';
import { CATEGORIES, LEVELS, MODES } from '../utils/constants';

const INITIAL = { q: '', city: '', category: '', mode: '', level: '', offers: '', wants: '', sort: 'relevance' };

export default function DiscoverPage() {
  const [filters, setFilters] = useState(INITIAL);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const debounced = useDebounce(filters, 400);

  useEffect(() => {
    skillApi.listSkills({ limit: 100 }).then((d) => setSuggestions(d.items)).catch(() => {});
  }, []);

  const params = useMemo(() => {
    const clean = Object.fromEntries(Object.entries(debounced).filter(([, v]) => v));
    return { ...clean, page, limit: 12 };
  }, [debounced, page]);

  const { data, loading, error, reload } = useFetch(() => userApi.discoverUsers(params), [params]);

  const update = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  };
  const clear = () => {
    setFilters(INITIAL);
    setPage(1);
  };
  const hasFilters = Object.entries(filters).some(([k, v]) => (k === 'sort' ? v !== 'relevance' : Boolean(v)));

  useEffect(() => {
    if (data && data.pagination.total > 0 && page > data.pagination.totalPages) setPage(data.pagination.totalPages);
  }, [data, page]);

  return (
    <>
      <PageHeader title="Find skills" subtitle="Search real members by skill, name or city." />

      <form className="card mb-6 p-4" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="f-q" className="label">Search skill or name</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input id="f-q" className="input pl-9" placeholder="Guitar, Excel, Priya..." maxLength={60} value={filters.q} onChange={(e) => update('q', e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="f-city" className="label">City</label>
            <input id="f-city" className="input" placeholder="Any city" maxLength={60} value={filters.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-category" className="label">Category</label>
            <select id="f-category" className="input" value={filters.category} onChange={(e) => update('category', e.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-mode" className="label">Learning mode</label>
            <select id="f-mode" className="input" value={filters.mode} onChange={(e) => update('mode', e.target.value)}>
              <option value="">Any mode</option>
              {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-level" className="label">Teacher experience</label>
            <select id="f-level" className="input" value={filters.level} onChange={(e) => update('level', e.target.value)}>
              <option value="">Any level</option>
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-offers" className="label">Offers skill</label>
            <input id="f-offers" list="skill-options" className="input" placeholder="e.g. Guitar" maxLength={50} value={filters.offers} onChange={(e) => update('offers', e.target.value)} />
          </div>
          <div>
            <label htmlFor="f-wants" className="label">Wants skill</label>
            <input id="f-wants" list="skill-options" className="input" placeholder="e.g. Excel" maxLength={50} value={filters.wants} onChange={(e) => update('wants', e.target.value)} />
          </div>
          <datalist id="skill-options">{suggestions.map((s) => <option key={s.id} value={s.name} />)}</datalist>
          <div>
            <label htmlFor="f-sort" className="label">Sort by</label>
            <select id="f-sort" className="input" value={filters.sort} onChange={(e) => update('sort', e.target.value)}>
              <option value="relevance">Relevance (best matches first)</option>
              <option value="recent">Recently updated</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" className="btn-secondary w-full" onClick={clear} disabled={!hasFilters}>
              <X className="h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          </div>
        </div>
      </form>

      {loading && !data ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Compass} title="No members found" description={hasFilters ? 'Try different keywords or clear some filters.' : 'No other members have joined yet. Invite a friend to get started!'} actionLabel={hasFilters ? 'Clear filters' : undefined} onAction={hasFilters ? clear : undefined} />
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500" aria-live="polite">{data.pagination.total} member{data.pagination.total === 1 ? '' : 's'} found</p>
          <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((u) => <ProfileCard key={u.id} user={u} onRequest={setTarget} />)}
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
        </>
      )}
      <SendRequestModal target={target} preferred={target?.overlap} onClose={() => setTarget(null)} />
    </>
  );
}
