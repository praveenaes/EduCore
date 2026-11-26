import { io, Socket } from 'socket.io-client';
import type { AppDispatch } from '../app/store';
import { addNotification } from '../app/slices/notificationSlice';
import { playNotificationSound } from '../utils/soundHelper';

let socket: Socket | null = null;

export const connectNotificationSocket = (
  token: string,
  dispatch: AppDispatch,
  currentUserId?: string,
  currentUserRole?: string
) => {
  if (socket && socket.connected) return;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const serverUrl =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'));

  socket = io(serverUrl, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Connected to notification socket server');
  });

  socket.on('connect_error', (err) => {
    console.warn('Notification socket connection error:', err.message);
  });

  socket.on('new_notification', (data) => {
    if (data.createdBy && currentUserId && String(data.createdBy) === String(currentUserId)) {
      return;
    }
    if (currentUserRole && currentUserRole.toUpperCase() === 'ADMIN' && data.createdBy === currentUserId) {
      return;
    }

    dispatch(addNotification(data));
    const titleLower = (data.title || '').toLowerCase();
    const isAlert =
      titleLower.includes('alert') ||
      titleLower.includes('emergency') ||
      titleLower.includes('warning') ||
      data.metadata?.entityType === 'alert';

    if (data.id) {
      sessionStorage.setItem(`sound_notif_played_${data.id}`, 'true');
    }
    playNotificationSound(isAlert ? 'alert' : 'normal');
  });
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};