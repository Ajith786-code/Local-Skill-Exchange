import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MessageSquare, Send, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../../utils/socket';
import * as messageApi from '../../api/messageApi';
import { getErrorMessage } from '../../api/axios';
import { formatTime } from '../../utils/formatters';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const MAX_LENGTH = 1000;

// Merge message lists without duplicates, ordered oldest -> newest.
const merge = (a, b) => {
  const map = new Map();
  [...a, ...b].forEach((m) => map.set(m.id, m));
  return [...map.values()].sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt) || x.id.localeCompare(y.id));
};

export default function ChatWindow({ requestId, currentUserId, canSend, partnerName }) {
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(socket.connected);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const stickToBottom = useRef(true);
  const listRef = useRef(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await messageApi.listMessages(requestId, { limit: 30 });
      setMessages(data.items);
      setHasMore(data.hasMore);
      stickToBottom.current = true;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    setMessages([]);
    loadInitial();
  }, [loadInitial]);

  // Real-time: join the room, receive messages, re-join and re-sync after reconnects.
  useEffect(() => {
    let active = true;
    const join = () => {
      socket.emit('chat:join', { requestId }, (res) => {
        if (active && res && !res.ok) toast.error(res.message || 'Could not join the live chat');
      });
    };
    const syncLatest = async () => {
      try {
        const data = await messageApi.listMessages(requestId, { limit: 30 });
        if (active) setMessages((prev) => merge(prev, data.items));
      } catch {
        /* the next reconnect will try again */
      }
    };
    const onMessage = (msg) => {
      if (msg.request !== requestId) return;
      setMessages((prev) => merge(prev, [msg]));
    };
    const onConnect = () => {
      setConnected(true);
      join();
      syncLatest();
    };
    const onDisconnect = () => setConnected(false);

    socket.on('message:new', onMessage);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);
    if (socket.connected) join();

    return () => {
      active = false;
      socket.emit('chat:leave', { requestId });
      socket.off('message:new', onMessage);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [requestId]);

  useEffect(() => {
    if (stickToBottom.current) bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const loadOlder = async () => {
    if (!messages.length) return;
    setLoadingOlder(true);
    const list = listRef.current;
    const previousHeight = list ? list.scrollHeight : 0;
    try {
      const data = await messageApi.listMessages(requestId, { before: messages[0].id, limit: 30 });
      stickToBottom.current = false;
      setMessages((prev) => merge(data.items, prev));
      setHasMore(data.hasMore);
      requestAnimationFrame(() => {
        if (list) list.scrollTop = list.scrollHeight - previousHeight;
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingOlder(false);
    }
  };

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const send = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    if (body.length > MAX_LENGTH) return toast.error(`Messages can be at most ${MAX_LENGTH} characters`);
    setSending(true);
    stickToBottom.current = true;
    try {
      let message;
      if (socket.connected) {
        // Real-time path with acknowledgement; falls back to the REST API on timeout.
        const res = await new Promise((resolve) => {
          socket.timeout(8000).emit('chat:send', { requestId, text: body }, (err, response) => {
            resolve(err ? { timedOut: true } : response);
          });
        });
        if (res.timedOut) {
          message = (await messageApi.sendMessage(requestId, body)).message;
        } else if (!res.ok) {
          throw new Error(res.message || 'Message could not be sent');
        } else {
          message = res.message;
        }
      } else {
        message = (await messageApi.sendMessage(requestId, body)).message;
      }
      setMessages((prev) => merge(prev, [message]));
      setText('');
    } catch (err) {
      toast.error(getErrorMessage(err, err.message));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (loading) return <LoadingSpinner label="Loading conversation..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadInitial} />;

  return (
    <div className="card flex h-[70vh] min-h-[420px] flex-col overflow-hidden">
      <div
        className={`flex items-center gap-2 border-b px-4 py-2 text-xs ${connected ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}
        role="status"
      >
        {connected ? <Wifi className="h-3.5 w-3.5" aria-hidden="true" /> : <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />}
        {connected ? 'Live: new messages appear instantly' : 'Reconnecting... messages you send are still saved'}
      </div>

      <div ref={listRef} onScroll={onScroll} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite" aria-label="Messages">
        {hasMore && (
          <div className="text-center">
            <button type="button" className="btn-secondary btn-sm" onClick={loadOlder} disabled={loadingOlder}>
              {loadingOlder ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null} Load older messages
            </button>
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <MessageSquare className="mb-2 h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-sm">Say hello to {partnerName} and plan your first session.</p>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender.id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 sm:max-w-[70%] ${mine ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-slate-100 text-slate-800'}`}>
                <p className={`text-xs font-semibold ${mine ? 'text-brand-100' : 'text-slate-500'}`}>{mine ? 'You' : m.sender.name || partnerName}</p>
                {/* Rendered as plain text, so any HTML typed by a user is shown literally and never executed. */}
                <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>
                <p className={`mt-1 text-right text-[10px] ${mine ? 'text-brand-100' : 'text-slate-400'}`}>{formatTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {canSend ? (
        <form onSubmit={send} className="border-t border-slate-200 p-3">
          <div className="flex items-end gap-2">
            <label htmlFor="chat-input" className="sr-only">Type a message</label>
            <textarea
              id="chat-input"
              rows={1}
              className="input max-h-32 min-h-[42px] flex-1 resize-none"
              placeholder="Type a message (Enter to send, Shift+Enter for a new line)"
              value={text}
              maxLength={MAX_LENGTH}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button type="submit" className="btn-primary h-[42px]" disabled={sending || !text.trim()} aria-label="Send message">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          <p className="mt-1 text-right text-[11px] text-slate-400">{text.length}/{MAX_LENGTH}</p>
        </form>
      ) : (
        <p className="border-t border-slate-200 bg-slate-50 p-3 text-center text-sm text-slate-500">This exchange is completed, so the chat is read-only.</p>
      )}
    </div>
  );
}
