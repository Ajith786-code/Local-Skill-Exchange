import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Inbox } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ListSkeleton } from '../components/common/Skeleton';
import RequestCard from '../components/requests/RequestCard';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import * as requestApi from '../api/requestApi';
import { getErrorMessage } from '../api/axios';
import { REQUEST_TABS } from '../utils/constants';

const BOXES = [
  { value: 'all', label: 'All' },
  { value: 'incoming', label: 'Incoming' },
  { value: 'outgoing', label: 'Outgoing' },
];

const CONFIRM = {
  accept: { title: 'Accept this request?', message: 'You will be able to chat with this person and plan your exchange.', label: 'Accept', danger: false },
  reject: { title: 'Reject this request?', message: 'The sender will be notified that you declined.', label: 'Reject', danger: true },
  cancel: { title: 'Cancel your request?', message: 'The other person will be notified that you cancelled.', label: 'Cancel request', danger: true },
  complete: { title: 'Mark exchange as completed?', message: 'The exchange is finished once both of you confirm it.', label: 'Mark as completed', danger: false },
};

const SUCCESS = {
  accept: () => 'Request accepted. You can now chat!',
  reject: () => 'Request rejected',
  cancel: () => 'Request cancelled',
  complete: (r) => (r.status === 'completed' ? 'Exchange completed. Great job!' : 'Marked as completed. Waiting for the other person.'),
};

export default function RequestsPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = REQUEST_TABS.some((t) => t.value === params.get('status')) ? params.get('status') : 'pending';
  const [box, setBox] = useState('all');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null); // { action, request }
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useFetch(() => requestApi.listRequests({ status, box, page, limit: 10 }), [status, box, page]);

  const selectTab = (value) => {
    setParams({ status: value });
    setPage(1);
  };

  const run = async () => {
    setBusy(true);
    try {
      const res = await requestApi.changeRequest(pending.request.id, pending.action);
      toast.success(SUCCESS[pending.action](res.request));
      setPending(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPending(null);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const cfg = pending ? CONFIRM[pending.action] : null;

  return (
    <>
      <PageHeader title="Exchange requests" subtitle="Manage the requests you sent and received." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Request status" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {REQUEST_TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={status === t.value}
              onClick={() => selectTab(t.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${status === t.value ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t.label}
              {data?.counts && <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 text-xs text-slate-700">{data.counts[t.value]}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="box" className="text-sm text-slate-600">Show</label>
          <select id="box" className="input w-auto" value={box} onChange={(e) => { setBox(e.target.value); setPage(1); }}>
            {BOXES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
      </div>

      {loading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Inbox} title={`No ${status} requests`} description={status === 'pending' ? 'Send a request from your matches or from Find skills to start an exchange.' : 'Requests with this status will show up here.'} actionLabel="Find skills" actionTo="/discover" />
      ) : (
        <>
          <div className={`space-y-4 ${loading ? 'opacity-60' : ''}`}>
            {data.items.map((r) => (
              <RequestCard key={r.id} request={r} currentUserId={user.id} busy={busy} onAction={(action, request) => setPending({ action, request })} />
            ))}
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog open={Boolean(pending)} title={cfg?.title} message={cfg?.message} confirmLabel={cfg?.label} danger={cfg?.danger} loading={busy} onConfirm={run} onCancel={() => setPending(null)} />
    </>
  );
}
