import { io } from 'socket.io-client';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
let origin = 'http://localhost:5000';
try {
  origin = new URL(apiBase).origin;
} catch {
  /* keep default */
}

// One shared connection. It is connected after login and closed on logout (see NotificationContext).
export const socket = io(import.meta.env.VITE_SOCKET_URL || origin, {
  withCredentials: true,
  autoConnect: false,
  reconnectionDelayMax: 8000,
});
