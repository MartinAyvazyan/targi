# Spec: Daily Check-In

## Files

- `src/components/DailyCheckInModal.tsx` — the modal
- `src/navigation/RootNavigator.tsx` — owns visibility + streak mutations
- `src/screens/HomeScreen.tsx` — inline (non-modal) check-in on the Home tab

## Purpose

Each day, for every period whose reminder time has passed and that hasn't been
checked in today, the user marks "clean day" or "hard day". This drives streaks.

## "Due for check-in"

`isDueForCheckIn(period)` (in `src/utils/period.ts`) =
`lastCheckInDate !== today()` AND `hasReminderTimePassed(reminderTime)`.

## DailyCheckInModal

Props:

```ts
{
  periods: RecoveryPeriod[];   // the due periods to ask about
  visible: boolean;
  onKeep: (id: string) => void;
  onRelapse: (id: string) => void;
  onClose: () => void;
}
```

- Asks about one period at a time (`activePeriod` = first unanswered).
- Tracks `answeredIds`; resets when `visible` becomes true.
- After answering, advances; when all answered, calls `onClose`.

## Streak mutations (in RootNavigator)

`keepToday(id)`:

- No-op if already checked in today.
- `currentStreak` = previous + 1 if `lastCheckInDate` was yesterday, else 1.
- Updates `bestStreak` and `totalCleanDays`, sets `lastCheckInDate = today()`.

`recordSlip(id)` (a.k.a. "hard day"):

- Calls `resetPeriod` (startDate→today, currentStreak→0, `bestStreak` preserved,
  `relapses + 1`) and shows a reassuring, non-judgmental Alert.
- `resetPeriod` registers an undo in the snackbar.

## Visibility wiring (RootNavigator)

- `checkInPeriods` = `sortedPeriods.filter(isDueForCheckIn)`.
- `visibleCheckInPeriods` narrows to a single period when opened from a specific
  notification (`targetCheckInPeriodId`).
- `closeCheckIn` clears the target and hides the modal.

> Note: the Home tab also exposes the same keep/slip actions inline so the user
> can check in without the modal. Keep both paths behavior-consistent.
