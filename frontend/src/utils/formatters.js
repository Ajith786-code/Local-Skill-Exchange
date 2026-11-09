export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(value) {
  if (!value) return '';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
