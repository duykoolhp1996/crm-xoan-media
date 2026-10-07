// Bộ hỗ trợ âm thanh Web Audio & Rung phản hồi cho Thông Báo trên iOS, Android & PC

let sharedAudioCtx: AudioContext | null = null;

// Mở khóa AudioContext khi người dùng chạm vào màn hình (Yêu cầu của iOS Safari)
export const unlockAudio = () => {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
  } catch {}
};

// Phát tiếng chuông ngân "Ding Chime" chất lượng cao (3 nốt D5 -> A5 -> D6)
export const playNotificationTone = () => {
  try {
    unlockAudio();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = sharedAudioCtx || new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Giai điệu chuông báo hiện đại (Apple Chime Style)
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch {}
};

// Rung phản hồi xúc giác trên thiết bị di động
export const vibrateDevice = (pattern: number[] = [150, 80, 150]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

// Kích hoạt Web Push / System Notification tương thích iOS PWA & Desktop
export const triggerNativePushNotification = async (title: string, body: string, url: string = '/') => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notifOptions = {
    body,
    icon: './favicon.png',
    badge: './favicon.png',
    tag: 'xoan-crm-' + Date.now(),
    data: { url }
  };

  // Ưu tiên Service Worker showNotification (Chuẩn bắt buộc của iOS 16.4+)
  if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, notifOptions);
      return;
    } catch {}
  }

  // Fallback Notification constructor cho Desktop / Android
  try {
    new Notification(title, notifOptions);
  } catch {}
};
