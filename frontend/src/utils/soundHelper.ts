let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

export const playNotificationSound = async (type: 'alert' | 'normal' = 'normal'): Promise<void> => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'alert') {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.15);
      osc1.frequency.setValueAtTime(880, now + 0.3);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.5);
      osc2.frequency.setValueAtTime(659.25, now + 0.65);
      osc2.frequency.setValueAtTime(987.77, now + 0.8);
      gain2.gain.setValueAtTime(0.4, now + 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.95);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.5);
      osc2.stop(now + 0.95);
    } else {
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.1);
      gain2.gain.setValueAtTime(0.001, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.4, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    }
  } catch (err) {
    console.warn('Audio notification could not be played:', err);
  }
};

export const checkAndPlayUnreadNotification = (notifications: Array<{
  id?: string;
  notificationId?: string;
  status?: string;
  notificationTitle?: string;
  title?: string;
  metadata?: any;
}>): void => {
  if (typeof window === 'undefined' || !notifications?.length) return;

  const unreadItem = notifications.find((item) => item.status !== 'READ');
  if (!unreadItem) return;

  const notifId = unreadItem.id || unreadItem.notificationId;
  if (!notifId) return;

  const key = `sound_notif_played_${notifId}`;
  if (sessionStorage.getItem(key)) return;

  sessionStorage.setItem(key, 'true');

  const title = (unreadItem.notificationTitle || unreadItem.title || '').toLowerCase();
  const isAlert =
    title.includes('alert') ||
    title.includes('emergency') ||
    title.includes('warning') ||
    unreadItem.metadata?.entityType === 'alert';

  playNotificationSound(isAlert ? 'alert' : 'normal');
};