import type { Quote } from "../data/quotes";
import type { AppActivity } from "../types/index";

// ─── Notification schedule metadata persisted to localStorage ────────────────
// So notifications can be re-established after app restarts.

const SCHEDULE_KEY = "vajra-notif-schedule";

interface ScheduledItem {
  id: string;
  type: "activity" | "streak-warn" | "morning-quote";
  activityId?: string;
  activityName?: string;
  activityEmoji?: string;
  reminderTime?: string;
  firesAt: number;
}

function loadSchedule(): ScheduledItem[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? (JSON.parse(raw) as ScheduledItem[]) : [];
  } catch {
    return [];
  }
}

function saveSchedule(items: ScheduledItem[]): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
}

function upsertScheduleItem(item: ScheduledItem): void {
  const items = loadSchedule().filter((i) => i.id !== item.id);
  items.push(item);
  saveSchedule(items);
}

function removeScheduleItem(id: string): void {
  const items = loadSchedule().filter((i) => i.id !== id);
  saveSchedule(items);
}

// ─── Timer registry (in-memory, re-established on every startup) ──────────────
const timers = new Map<string, ReturnType<typeof setTimeout>>();

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

// ─── Core notification helper — uses SW for reliable delivery ─────────────────

function notify(
  title: string,
  body: string,
  icon = "/icons/icon-192.svg",
  tag?: string,
): void {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;

  // Try SW notification first (works in background)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      body,
      icon,
      tag: tag ?? "vajra-notification",
    });
  } else {
    // Fallback to direct Notification API
    try {
      new Notification(title, {
        body,
        icon,
        tag,
        badge: "/icons/icon-192.svg",
        silent: false,
      });
    } catch {
      // Notifications may be blocked
    }
  }
}

// ─── Schedule activity reminder ───────────────────────────────────────────────

export function scheduleActivityReminder(activity: AppActivity): void {
  if (!activity.reminderTime) return;
  cancelActivityReminder(activity.id);

  const [hours, minutes] = activity.reminderTime.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();

  // Persist so we can re-establish on next startup
  upsertScheduleItem({
    id: activity.id,
    type: "activity",
    activityId: activity.id,
    activityName: activity.name,
    activityEmoji: activity.emoji,
    reminderTime: activity.reminderTime,
    firesAt: Date.now() + delay,
  });

  const timer = setTimeout(() => {
    notify(
      `Time for ${activity.emoji} ${activity.name}`,
      "Tap to complete your daily practice and keep your streak alive.",
      undefined,
      `reminder-${activity.id}`,
    );
    // Remove from schedule after firing, then reschedule for next day
    removeScheduleItem(activity.id);
    scheduleActivityReminder(activity);
  }, delay);

  timers.set(activity.id, timer);
}

export function cancelActivityReminder(activityId: string): void {
  const existing = timers.get(activityId);
  if (existing !== undefined) {
    clearTimeout(existing);
    timers.delete(activityId);
  }
  removeScheduleItem(activityId);
}

// ─── Streak warning (11pm if not completed) ───────────────────────────────────

export function scheduleStreakWarning(
  activityId: string,
  activityName: string,
): void {
  const key = `streak-warn-${activityId}`;

  // Clear existing
  const existing = timers.get(key);
  if (existing !== undefined) {
    clearTimeout(existing);
    timers.delete(key);
  }

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(23, 0, 0, 0); // 11pm warning

  if (midnight <= now) return; // already past 11pm today

  const delay = midnight.getTime() - now.getTime();

  upsertScheduleItem({
    id: key,
    type: "streak-warn",
    activityId,
    activityName,
    firesAt: Date.now() + delay,
  });

  const timer = setTimeout(() => {
    notify(
      `⚠️ Streak at Risk: ${activityName}`,
      "One hour left to complete your activity and protect your streak!",
      undefined,
      `streak-warn-${activityId}`,
    );
    removeScheduleItem(key);
  }, delay);

  timers.set(key, timer);
}

// ─── Morning quote ────────────────────────────────────────────────────────────

export function scheduleMorningQuote(quote: Quote, timeStr: string): void {
  const key = "morning-quote";
  const existing = timers.get(key);
  if (existing !== undefined) {
    clearTimeout(existing);
    timers.delete(key);
  }

  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target.getTime() - now.getTime();

  upsertScheduleItem({
    id: key,
    type: "morning-quote",
    reminderTime: timeStr,
    firesAt: Date.now() + delay,
  });

  const timer = setTimeout(() => {
    notify(
      `"${quote.text.slice(0, 60)}…"`,
      `— ${quote.author}`,
      undefined,
      "morning-quote",
    );
    removeScheduleItem(key);
  }, delay);

  timers.set(key, timer);
}

// Keep legacy sendMorningQuote for immediate sends
export function sendMorningQuote(quote: Quote): void {
  notify(
    `"${quote.text.slice(0, 60)}…"`,
    `— ${quote.author}`,
    undefined,
    "morning-quote",
  );
}

// ─── Check and warn streaks on app open ──────────────────────────────────────

export function checkAndWarnStreaks(
  activities: AppActivity[],
  completedToday: Set<string>,
): void {
  const now = new Date();
  const hour = now.getHours();
  // Only warn after 8pm if not yet completed
  if (hour < 20) return;

  for (const activity of activities) {
    if (!completedToday.has(activity.id)) {
      scheduleStreakWarning(activity.id, activity.name);
    }
  }
}

// ─── Restore all scheduled notifications on app startup ──────────────────────
// Call this once on app mount when permission is granted.

export function restoreNotificationSchedules(
  activities: AppActivity[],
  notifPrefs: {
    morningQuoteEnabled: boolean;
    morningQuoteTime: string;
    streakWarningEnabled: boolean;
  },
  quotes: Quote[],
): void {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;

  // Clear all in-memory timers first
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }
  timers.clear();

  // Reschedule activity reminders
  for (const activity of activities) {
    if (activity.reminderTime) {
      scheduleActivityReminder(activity);
    }
  }

  // Reschedule streak warnings if enabled
  if (notifPrefs.streakWarningEnabled) {
    for (const activity of activities) {
      // Will only fire if there's time left today (scheduleStreakWarning handles this)
      scheduleStreakWarning(activity.id, activity.name);
    }
  }

  // Reschedule morning quote if enabled
  if (notifPrefs.morningQuoteEnabled && quotes.length > 0) {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    scheduleMorningQuote(quote, notifPrefs.morningQuoteTime);
  }
}
