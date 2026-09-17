# Spec: Notifications (Daily Reminders)

## Files

- `src/utils/notifications.ts` — all expo-notifications logic
- `src/navigation/RootNavigator.tsx` — routing + periodic sync effects

## Purpose

Schedule one daily local notification per period at its `reminderTime`, route the
user into the correct check-in when they tap it, and keep scheduled OS
notifications in sync with the current periods.

## Setup

`Notifications.setNotificationHandler(...)` runs at module load in
`notifications.ts` (banner + sound, no badge). Importing the module anywhere
(RootNavigator does) installs the handler.

Web is a no-op for all scheduling (`Platform.OS === 'web'` guards).

## Helpers (`src/utils/notifications.ts`)

- `ensureNotificationPermissions()` — Android channel `daily-check` + permission
  request; returns whether granted.
- `scheduleDailyCheckNotification(period)` — schedules a DAILY trigger at the
  period's hour/minute; notification `data` carries `periodId` + `screen`.
  Returns the scheduled id (or `undefined` if not granted / web).
- `getNotificationPeriodId(response)` / `getNotificationRequestPeriodId(request)`
  — extract `periodId` from a tapped response / a scheduled request.
- `notificationMatchesReminderTime(request, reminderTime)` — does a scheduled
  request's trigger match the period's time? (used for dedupe/sync).

## Routing (RootNavigator effect)

On launch and on `AppState` → `active`:

- `getLastNotificationResponse()` → if it has a `periodId`, set
  `targetCheckInPeriodId` so only that period's check-in shows; else show all due.
- `addNotificationResponseReceivedListener` handles taps while running.

## Sync (RootNavigator effect, runs when periods change)

`syncNotifications()`:

1. Fetch all scheduled notifications.
2. Cancel any whose `periodId` no longer exists.
3. Per active period: keep one request matching the current reminder time,
   cancel duplicates; if none match, schedule a fresh one.
4. Write back resulting `notificationId`s into `periods` (only if changed).

Deleting a period cancels its `notificationId` (see `deletePeriod`).

## Notes for changes

- Always keep the web/native guards.
- If you change reminder semantics, update both `scheduleDailyCheckNotification`
  and `notificationMatchesReminderTime` so sync stays idempotent.
