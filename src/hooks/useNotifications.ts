import { useCallback, useEffect } from 'react';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import type { WorkEntry, UserSettings } from '@/types';

const STORAGE_KEY = 'volantia_notifications';
const LAST_WEEKLY_KEY = 'volantia_last_weekly';
const LAST_DAILY_KEY = 'volantia_last_daily_check';
const PERMISSION_ASKED_KEY = 'volantia_notif_permission_asked';

export interface VolantiaNotification {
  id: string;
  type: 'missing_entry' | 'weekly_summary' | 'diet_missing' | 'consecutive_days' | 'month_closing' | 'extra_hours';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  icon?: string;
}

// ─── Helpers ─────────────────────────────────────────────────
function saveNotifications(notifs: VolantiaNotification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 50))); } catch { /* ignore */ }
}

function loadNotifications(): VolantiaNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function addNotification(notif: Omit<VolantiaNotification, 'id' | 'timestamp' | 'read'>) {
  const notifs = loadNotifications();
  // Avoid duplicates of same type within 24h
  const recent = notifs.find(n => n.type === notif.type && Date.now() - n.timestamp < 86400000);
  if (recent) return;
  const newNotif: VolantiaNotification = {
    ...notif,
    id: `${notif.type}_${Date.now()}`,
    timestamp: Date.now(),
    read: false,
  };
  saveNotifications([newNotif, ...notifs]);
  // Also fire browser notification if permission granted
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(notif.title, {
      body: notif.body,
      icon: '/pwa-192x192.png',
      badge: '/favicon.png',
      tag: notif.type, // prevents duplicate OS notifications
    });
  }
}

// ─── Analysis functions ───────────────────────────────────────

function checkMissingToday(entries: WorkEntry[]) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const hour = new Date().getHours();
  // Only remind after 9am
  if (hour < 9) return;
  const hasTodayEntry = entries.some(e => e.date === todayStr);
  if (!hasTodayEntry) {
    addNotification({
      type: 'missing_entry',
      title: '🚛 ¿Has fichado hoy?',
      body: 'No tienes jornada registrada hoy. ¡No pierdas tus horas!',
    });
  }
}

function checkDietsMissing(entries: WorkEntry[], settings: UserSettings) {
  // Check last 7 days for days with >8h but no diets
  const suspects: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === d);
    if (!entry || entry.serviceType !== 'regular') continue;
    const [sh, sm] = entry.startTime.split(':').map(Number);
    const [eh, em] = entry.endTime.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 1440;
    const hours = (mins - entry.breakMinutes) / 60;
    const totalDiets = entry.fullDietsNational + entry.halfDietsNational +
                       entry.fullDietsInternational + entry.halfDietsInternational;
    if (hours >= 8 && totalDiets === 0) {
      suspects.push(format(parseISO(d), 'dd/MM'));
    }
  }
  if (suspects.length >= 2) {
    addNotification({
      type: 'diet_missing',
      title: '🍽️ Dietas sin registrar',
      body: `Los días ${suspects.join(', ')} tienes más de 8h sin dieta. Revisa tus registros.`,
    });
  }
}

function checkConsecutiveDays(entries: WorkEntry[]) {
  // Count consecutive working days ending today
  let count = 0;
  for (let i = 0; i <= 13; i++) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === d);
    if (entry && (entry.serviceType === 'regular' || entry.serviceType === 'extra')) {
      count++;
    } else {
      break;
    }
  }
  if (count >= 6) {
    addNotification({
      type: 'consecutive_days',
      title: '⚠️ Descanso obligatorio',
      body: `Llevas ${count} días seguidos trabajando. El convenio limita a 6 días consecutivos.`,
    });
  }
}

function checkMonthClosing(entries: WorkEntry[]) {
  const today = new Date();
  const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
  if (daysLeft !== 3) return; // Only notify 3 days before end of month
  const monthStr = format(today, 'yyyy-MM');
  const monthEntries = entries.filter(e => e.date.startsWith(monthStr) && e.serviceType === 'regular');
  addNotification({
    type: 'month_closing',
    title: '📅 Cierre de mes en 3 días',
    body: `Tienes ${monthEntries.length} jornadas registradas este mes. ¿Está todo completo?`,
  });
}

function checkWeeklySummary(entries: WorkEntry[], settings: UserSettings) {
  const lastWeekly = localStorage.getItem(LAST_WEEKLY_KEY);
  const now = Date.now();
  // Send every Sunday after 6pm
  const today = new Date();
  if (today.getDay() !== 0 || today.getHours() < 18) return;
  if (lastWeekly && now - parseInt(lastWeekly) < 6 * 86400000) return; // max once per 6 days

  // Calculate last 7 days
  let weekHours = 0;
  let weekDiets = 0;
  let weekNet = 0;
  for (let i = 0; i < 7; i++) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === d);
    if (!entry || entry.serviceType === 'rest') continue;
    const [sh, sm] = entry.startTime.split(':').map(Number);
    const [eh, em] = entry.endTime.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 1440;
    weekHours += (mins - entry.breakMinutes) / 60;
    weekDiets += entry.fullDietsNational + entry.halfDietsNational +
                 entry.fullDietsInternational + entry.halfDietsInternational;
    // Rough net estimate
    weekNet += (entry.fullDietsNational * settings.fullDietNational) +
               (entry.halfDietsNational * settings.halfDietNational) +
               (entry.fullDietsInternational * settings.fullDietInternational) +
               (entry.overnights * settings.overnightNational) +
               (entry.nightHours * settings.nightHourRate) +
               (entry.extraHours * settings.extraHourRate) +
               (entry.kilometers * settings.kilometerRate);
  }

  if (weekHours > 0) {
    addNotification({
      type: 'weekly_summary',
      title: '📊 Resumen semanal',
      body: `Esta semana: ${Math.round(weekHours)}h trabajadas · ${weekDiets} dietas · ${Math.round(weekNet)}€ variable`,
    });
    localStorage.setItem(LAST_WEEKLY_KEY, String(now));
  }
}

// ─── Main hook ────────────────────────────────────────────────

export function useNotifications(entries: WorkEntry[], settings: UserSettings) {

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    const result = await Notification.requestPermission();
    try { localStorage.setItem(PERMISSION_ASKED_KEY, 'true'); } catch { /* ignore */ }
    return result;
  }, []);

  const getPermission = useCallback(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  }, []);

  const hasAskedPermission = useCallback(() => {
    try { return localStorage.getItem(PERMISSION_ASKED_KEY) === 'true'; } catch { return false; }
  }, []);

  const getNotifications = useCallback((): VolantiaNotification[] => {
    return loadNotifications();
  }, []);

  const getUnreadCount = useCallback((): number => {
    return loadNotifications().filter(n => !n.read).length;
  }, []);

  const markAllRead = useCallback(() => {
    const notifs = loadNotifications().map(n => ({ ...n, read: true }));
    saveNotifications(notifs);
  }, []);

  const markRead = useCallback((id: string) => {
    const notifs = loadNotifications().map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(notifs);
  }, []);

  const clearAll = useCallback(() => {
    saveNotifications([]);
  }, []);

  // Run checks once per session (not on every render)
  useEffect(() => {
    if (!entries.length) return;
    const lastCheck = localStorage.getItem(LAST_DAILY_KEY);
    const now = Date.now();
    // Run at most once per hour
    if (lastCheck && now - parseInt(lastCheck) < 3600000) return;
    localStorage.setItem(LAST_DAILY_KEY, String(now));

    checkMissingToday(entries);
    checkDietsMissing(entries, settings);
    checkConsecutiveDays(entries);
    checkMonthClosing(entries);
    checkWeeklySummary(entries, settings);
  }, [entries.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    requestPermission,
    getPermission,
    hasAskedPermission,
    getNotifications,
    getUnreadCount,
    markAllRead,
    markRead,
    clearAll,
  };
}
