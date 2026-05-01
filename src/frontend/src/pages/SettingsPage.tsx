import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronRight,
  DatabaseZap,
  Info,
  Pencil,
  Trash2,
  Volume2,
  VolumeX,
  X,
  ZapOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Separator } from "../components/ui/separator";
import { Switch } from "../components/ui/switch";
import { QUOTES } from "../data/quotes";
import {
  cancelActivityReminder,
  checkAndWarnStreaks,
  requestPermission,
  restoreNotificationSchedules,
  scheduleActivityReminder,
  scheduleMorningQuote,
  sendMorningQuote,
} from "../services/notifications";
import { useVajraStore } from "../store/vajraStore";
import type { AppActivity } from "../types/index";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  delay = 0,
}: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card rounded-2xl border border-border/60 overflow-hidden"
    >
      <div className="px-4 py-3 bg-muted/30 border-b border-border/40">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-border/40">{children}</div>
    </motion.section>
  );
}

// ─── Setting row ──────────────────────────────────────────────────────────────

function SettingRow({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3.5 min-h-[56px] ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Activity reminder row ────────────────────────────────────────────────────

function ActivityReminderRow({
  activity,
  permission,
}: { activity: AppActivity; permission: NotificationPermission }) {
  const updateActivityReminder = useVajraStore((s) => s.updateActivityReminder);
  const [time, setTime] = useState(activity.reminderTime ?? "08:00");
  const [enabled, setEnabled] = useState(!!activity.reminderTime);

  function handleToggle(next: boolean) {
    setEnabled(next);
    if (!next) {
      cancelActivityReminder(activity.id);
      updateActivityReminder(activity.id, null);
      toast.success(`Reminder off for ${activity.name}`);
    } else {
      const updatedActivity = { ...activity, reminderTime: time };
      scheduleActivityReminder(updatedActivity);
      updateActivityReminder(activity.id, time);
      toast.success(`Reminder set for ${activity.name} at ${time}`);
    }
  }

  function handleTimeChange(newTime: string) {
    setTime(newTime);
    if (enabled) {
      const updatedActivity = { ...activity, reminderTime: newTime };
      scheduleActivityReminder(updatedActivity);
      updateActivityReminder(activity.id, newTime);
    }
  }

  return (
    <SettingRow>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl shrink-0">{activity.emoji}</span>
        <span className="text-sm font-medium text-foreground truncate">
          {activity.name}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {enabled && permission === "granted" && (
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            data-ocid={`settings.activity_reminder_time.${activity.id}`}
            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`Reminder time for ${activity.name}`}
          />
        )}
        <Switch
          checked={enabled && permission === "granted"}
          onCheckedChange={handleToggle}
          disabled={permission !== "granted"}
          data-ocid={`settings.activity_reminder_toggle.${activity.id}`}
          aria-label={`Reminder for ${activity.name}`}
        />
      </div>
    </SettingRow>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const navigate = useNavigate();

  // All settings from store — no backend queries
  const userProfile = useVajraStore((s) => s.userProfile);
  const activities = useVajraStore((s) => s.activities);
  const settings = useVajraStore((s) => s.settings);
  const streaks = useVajraStore((s) => s.streaks);
  const notificationPermission = useVajraStore((s) => s.notificationPermission);
  const updateSettings = useVajraStore((s) => s.updateSettings);
  const updateNotifSettings = useVajraStore((s) => s.updateNotifSettings);
  const setUserProfile = useVajraStore((s) => s.setUserProfile);
  const setNotificationPermission = useVajraStore(
    (s) => s.setNotificationPermission,
  );
  const removeActivity = useVajraStore((s) => s.removeActivity);

  const notifSettings = settings.notifications;

  // Profile editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  // Text size from settings
  const textSize = settings.textSize;

  // Apply body classes for accessibility settings
  useEffect(() => {
    const body = document.body;
    body.classList.toggle("no-motion", !settings.animationsEnabled);
    body.classList.toggle("high-contrast", settings.highContrast);
    body.classList.remove(
      "text-scale-small",
      "text-scale-medium",
      "text-scale-large",
    );
    if (textSize !== "medium") body.classList.add(`text-scale-${textSize}`);
  }, [settings.animationsEnabled, settings.highContrast, textSize]);

  // On mount: check streaks if permission granted
  useEffect(() => {
    if (notificationPermission === "granted" && activities.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const completedToday = new Set(
        Object.entries(streaks)
          .filter(([, s]) => s.lastCompletedDate === today)
          .map(([id]) => id),
      );
      checkAndWarnStreaks(activities, completedToday);
    }
  }, [notificationPermission, activities, streaks]);

  function startEditName() {
    setNameInput(userProfile?.name ?? "");
    setEditingName(true);
    setTimeout(() => nameRef.current?.focus(), 50);
  }

  function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUserProfile({
      name: trimmed,
      onboardingComplete: true,
      createdAt: userProfile?.createdAt ?? Date.now(),
    });
    setEditingName(false);
    toast.success("Name updated");
  }

  function cancelEditName() {
    setEditingName(false);
    setNameInput("");
  }

  async function handleRequestPermission() {
    const perm = await requestPermission();
    setNotificationPermission(perm);
    if (perm === "granted") {
      toast.success("Notifications enabled!");
      restoreNotificationSchedules(activities, notifSettings, QUOTES);
    } else if (perm === "denied") {
      toast.error("Notifications blocked. Enable in browser settings.");
    }
  }

  function handleMorningQuoteToggle(on: boolean) {
    updateNotifSettings({ morningQuoteEnabled: on });
    if (on) {
      const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      scheduleMorningQuote(quote, notifSettings.morningQuoteTime);
      toast.info(
        `Morning quote scheduled at ${notifSettings.morningQuoteTime}`,
      );
      sendMorningQuote(quote);
    }
  }

  function handleTextSizeChange(val: string) {
    updateSettings({ textSize: val as "small" | "medium" | "large" });
  }

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: userProfile,
      activities,
      streaks,
      settings,
    };
    const blob = new Blob(
      [
        JSON.stringify(
          data,
          (_, v) => (typeof v === "bigint" ? v.toString() : v),
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vajra-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  }

  const joinedDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const permBadge = {
    granted: (
      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
        Granted
      </Badge>
    ),
    denied: (
      <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
        Denied
      </Badge>
    ),
    default: (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Not Set
      </Badge>
    ),
  }[notificationPermission];

  return (
    <div data-ocid="settings.page" className="space-y-4 pb-4">
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-2 pb-1"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customize your Vajra experience
        </p>
      </motion.div>

      {/* ── Profile ─────────────────────────────────────────────────────────── */}
      <Section title="Profile" delay={0.05}>
        <SettingRow>
          {editingName ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Input
                ref={nameRef}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") cancelEditName();
                }}
                data-ocid="settings.name_input"
                className="h-8 text-sm bg-muted/60"
                maxLength={40}
                aria-label="Display name"
              />
              <button
                type="button"
                onClick={saveName}
                data-ocid="settings.name_save_button"
                className="p-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                aria-label="Save name"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={cancelEditName}
                data-ocid="settings.name_cancel_button"
                className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cancel edit"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-display font-bold text-primary shrink-0">
                {(userProfile?.name ?? "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground truncate">
                  {userProfile?.name ?? "Practitioner"}
                </p>
                {joinedDate && (
                  <p className="text-xs text-muted-foreground">
                    Joined {joinedDate}
                  </p>
                )}
              </div>
            </div>
          )}
          {!editingName && (
            <button
              type="button"
              onClick={startEditName}
              data-ocid="settings.edit_name_button"
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Edit display name"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </SettingRow>
      </Section>

      {/* ── Notifications ───────────────────────────────────────────────────── */}
      <Section title="Notifications" delay={0.1}>
        {/* Permission toggle row */}
        <SettingRow>
          <div className="flex items-center gap-3 min-w-0">
            {notificationPermission === "granted" ? (
              <Bell className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Enable Notifications
              </p>
              <p className="text-xs text-muted-foreground">
                Allow Vajra to send reminders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {permBadge}
            {notificationPermission !== "granted" &&
              notificationPermission !== "denied" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRequestPermission}
                  data-ocid="settings.request_permission_button"
                  className="text-xs h-7 px-2"
                >
                  Enable
                </Button>
              )}
          </div>
        </SettingRow>

        {/* Denied instructions */}
        {notificationPermission === "denied" && (
          <div className="px-4 py-3 bg-destructive/5 border-t border-destructive/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-destructive">
                  Notifications Blocked
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  To re-enable: tap the lock/info icon in your browser address
                  bar → Site settings → Notifications → Allow.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active status */}
        {notificationPermission === "granted" && (
          <div className="px-4 py-2.5 bg-primary/5 border-t border-primary/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-xs text-primary font-medium">
                Notifications active — restored on every app open
              </p>
            </div>
          </div>
        )}

        {/* Sub-options when granted */}
        {notificationPermission === "granted" && (
          <>
            <SettingRow className="bg-muted/10">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Morning Motivation Quote
                </p>
                <p className="text-xs text-muted-foreground">
                  Daily quote to start your day
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {notifSettings.morningQuoteEnabled && (
                  <input
                    type="time"
                    value={notifSettings.morningQuoteTime}
                    onChange={(e) =>
                      updateNotifSettings({ morningQuoteTime: e.target.value })
                    }
                    data-ocid="settings.morning_quote_time"
                    className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Morning quote time"
                  />
                )}
                <Switch
                  checked={notifSettings.morningQuoteEnabled}
                  onCheckedChange={handleMorningQuoteToggle}
                  data-ocid="settings.morning_quote_toggle"
                  aria-label="Morning motivation quote"
                />
              </div>
            </SettingRow>

            <SettingRow className="bg-muted/10">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Streak at Risk Warning
                </p>
                <p className="text-xs text-muted-foreground">
                  Alert 1 hour before midnight
                </p>
              </div>
              <Switch
                checked={notifSettings.streakWarningEnabled}
                onCheckedChange={(on) =>
                  updateNotifSettings({ streakWarningEnabled: on })
                }
                data-ocid="settings.streak_warning_toggle"
                aria-label="Streak at risk warning"
              />
            </SettingRow>

            <div className="px-4 py-2 bg-muted/5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Per-Activity Reminders
              </p>
            </div>
            {activities.length === 0 ? (
              <SettingRow>
                <p className="text-sm text-muted-foreground">
                  No activities yet
                </p>
              </SettingRow>
            ) : (
              activities.map((act) => (
                <ActivityReminderRow
                  key={act.id}
                  activity={act}
                  permission={notificationPermission}
                />
              ))
            )}
          </>
        )}
      </Section>

      {/* ── Appearance & Accessibility ──────────────────────────────────────── */}
      <Section title="Appearance & Accessibility" delay={0.15}>
        {/* Sound Effects */}
        <SettingRow>
          <div className="flex items-center gap-3 min-w-0">
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <VolumeX className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Sound Effects
              </p>
              <p className="text-xs text-muted-foreground">
                Celebration and completion sounds
              </p>
            </div>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(on) => updateSettings({ soundEnabled: on })}
            data-ocid="settings.sound_toggle"
            aria-label="Sound effects"
          />
        </SettingRow>

        {/* Animations */}
        <SettingRow>
          <div className="flex items-center gap-3 min-w-0">
            {settings.animationsEnabled ? (
              <ChevronRight className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <ZapOff className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Animations</p>
              <p className="text-xs text-muted-foreground">
                Fire flames and motion effects
              </p>
            </div>
          </div>
          <Switch
            checked={settings.animationsEnabled}
            onCheckedChange={(on) => updateSettings({ animationsEnabled: on })}
            data-ocid="settings.animations_toggle"
            aria-label="Animations"
          />
        </SettingRow>

        {/* High Contrast */}
        <SettingRow>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              High Contrast Mode
            </p>
            <p className="text-xs text-muted-foreground">
              Increased text and border contrast
            </p>
          </div>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(on) => updateSettings({ highContrast: on })}
            data-ocid="settings.high_contrast_toggle"
            aria-label="High contrast mode"
          />
        </SettingRow>

        {/* Text Size */}
        <SettingRow className="flex-col items-start gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Text Size</p>
            <p className="text-xs text-muted-foreground">
              Adjust reading comfort
            </p>
          </div>
          <RadioGroup
            value={textSize}
            onValueChange={handleTextSizeChange}
            className="flex gap-3"
            data-ocid="settings.text_size_radio"
          >
            {(["small", "medium", "large"] as const).map((size) => (
              <Label
                key={size}
                htmlFor={`text-size-${size}`}
                className="flex items-center gap-1.5 cursor-pointer group"
              >
                <RadioGroupItem
                  value={size}
                  id={`text-size-${size}`}
                  data-ocid={`settings.text_size.${size}`}
                  className="border-border"
                />
                <span
                  className={`font-medium transition-colors group-hover:text-foreground ${
                    textSize === size ? "text-primary" : "text-muted-foreground"
                  } ${size === "small" ? "text-xs" : size === "large" ? "text-base" : "text-sm"}`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </SettingRow>
      </Section>

      {/* ── Activity Management ─────────────────────────────────────────────── */}
      <Section title="Activity Management" delay={0.2}>
        {activities.length === 0 ? (
          <SettingRow data-ocid="settings.activities.empty_state">
            <p className="text-sm text-muted-foreground">
              No activities yet. Add one from the dashboard!
            </p>
          </SettingRow>
        ) : (
          activities.map((act, i) => (
            <SettingRow
              key={act.id}
              data-ocid={`settings.activities.item.${i + 1}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl shrink-0">{act.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {act.name}
                  </p>
                  {act.isPredefined && (
                    <p className="text-xs text-muted-foreground">
                      Default activity
                    </p>
                  )}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={activities.length === 1}
                    data-ocid={`settings.activities.delete_button.${i + 1}`}
                    aria-label={`Delete ${act.name}`}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  data-ocid={`settings.activities.delete_dialog.${i + 1}`}
                  className="bg-card border-border"
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                      Delete {act.emoji} {act.name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will permanently delete the activity and all its
                      streak data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      data-ocid={`settings.activities.delete_cancel.${i + 1}`}
                      className="bg-muted border-border text-foreground hover:bg-muted/80"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      data-ocid={`settings.activities.delete_confirm.${i + 1}`}
                      onClick={() => {
                        cancelActivityReminder(act.id);
                        removeActivity(act.id);
                        toast.success(`${act.name} deleted`);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SettingRow>
          ))
        )}
        <SettingRow>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Add activities from the Dashboard");
              navigate({ to: "/" });
            }}
            data-ocid="settings.add_activity_button"
            className="w-full border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
          >
            + Add Activity
          </Button>
        </SettingRow>
      </Section>

      {/* ── Data ───────────────────────────────────────────────────────────── */}
      <Section title="Data" delay={0.25}>
        <SettingRow>
          <div className="flex items-center gap-3 min-w-0">
            <DatabaseZap className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Export Data</p>
              <p className="text-xs text-muted-foreground">
                Download all your streak data as JSON
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportData}
            data-ocid="settings.export_button"
            className="text-xs h-8 px-3 border-border text-foreground hover:bg-muted/60"
          >
            Export
          </Button>
        </SettingRow>
      </Section>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <Section title="About" delay={0.3}>
        <div className="px-4 py-5 space-y-3">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Vajra — Discipline Streak Tracker
              </p>
              <p className="text-xs text-muted-foreground">Version 5.0.0</p>
            </div>
          </div>
          <Separator className="bg-border/60" />
          <p className="text-sm text-muted-foreground leading-relaxed quote-text">
            "Vajra means thunderbolt — unbreakable, unstoppable, indestructible.
            This app was built on the philosophy that honest self-awareness is
            more powerful than perfect streaks. Break honestly. Begin again
            fearlessly."
          </p>
          <p className="text-xs text-muted-foreground">
            All data stays on your device. No account required. No guilt, only
            growth.
          </p>
        </div>
      </Section>

      {/* ── Branding footer ────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground py-2">
        © {new Date().getFullYear()}. Built with Suraj
      </p>
    </div>
  );
}
