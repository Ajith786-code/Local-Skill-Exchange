import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';
import { ListSkeleton } from '../components/common/Skeleton';
import useFetch from '../hooks/useFetch';
import * as messageApi from '../api/messageApi';
import { timeAgo } from '../utils/formatters';

export default function MessagesPage() {
  const { data, loading, error, reload } = useFetch(() => messageApi.listConversations(), []);
  return (
    <>
      <PageHeader title="Messages" subtitle="Chat with people whose exchange request was accepted." />
      {loading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : data.items.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No conversations yet" description="Chats open automatically once an exchange request is accepted." actionLabel="View requests" actionTo="/requests" />
      ) : (
        <ul className="space-y-2">
          {data.items.map((c) => (
            <li key={c.requestId}>
              <Link to={`/messages/${c.requestId}`} className="card flex items-center gap-3 p-4 hover:bg-slate-50">
                <Avatar name={c.partner.name} src={c.partner.avatar} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-slate-900">{c.partner.name}</p>
                    {c.lastMessage && <span className="shrink-0 text-xs text-slate-500">{timeAgo(c.lastMessage.createdAt)}</span>}
                  </div>
                  <p className="text-xs text-slate-500">{c.offeredSkill} ↔ {c.requestedSkill}{c.status === 'completed' ? ' · Completed' : ''}</p>
                  <p className="truncate text-sm text-slate-600">{c.lastMessage ? c.lastMessage.text : 'No messages yet. Say hello!'}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
