import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChatWindow from '../components/chat/ChatWindow';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import * as requestApi from '../api/requestApi';

export default function ChatPage() {
  const { requestId } = useParams();
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => requestApi.getRequest(requestId), [requestId]);

  if (loading && !data) return <LoadingSpinner label="Opening conversation..." />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const request = data.request;
  const partner = request.role === 'sender' ? request.receiver : request.sender;
  const mySkill = request.role === 'sender' ? request.offeredSkill : request.requestedSkill;
  const theirSkill = request.role === 'sender' ? request.requestedSkill : request.offeredSkill;
  const chatAllowed = ['accepted', 'completed'].includes(request.status);

  return (
    <>
      <Link to="/messages" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All messages
      </Link>
      <div className="mb-4 flex items-center gap-3">
        <Avatar name={partner.name} src={partner.avatar} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900"><Link to={`/users/${partner.id}`} className="hover:text-brand-700">{partner.name}</Link></h1>
          <p className="text-sm text-slate-500">You teach {mySkill} · You learn {theirSkill}</p>
        </div>
        <span className="badge ml-auto bg-slate-100 capitalize text-slate-700">{request.status}</span>
      </div>
      {chatAllowed ? (
        <ChatWindow key={requestId} requestId={requestId} currentUserId={user.id} canSend={request.status === 'accepted'} partnerName={partner.name} />
      ) : (
        <ErrorMessage message="Chat is only available for accepted exchanges." />
      )}
    </>
  );
}
