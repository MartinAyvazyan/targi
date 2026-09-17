# Spec: Add Period (Create Wizard)

## File
- `src/screens/AddScreen.tsx`

## Purpose
The "Սկսել" (Start) tab: a 2-step wizard to create a new `RecoveryPeriod`.

## Props
```ts
{
  navigation: BottomTabNavigationProp<RootTabParamList, 'Add'>;
  onAdd: (period: RecoveryPeriod) => void;  // RootNavigator.addPeriod
}
```

## Steps (`stage` state: 1 → 2)
**Stage 1 — Type:** pick a main addiction type from `addictionTypes`
(`selectType`). Resets subtype selection.

**Stage 2 — Details:** a quick-start summary plus editable fields:
- **Start date** — date-key; native picker (Android inline / iOS modal),
  `<input type="date">` on web.
- **Milestone** — chosen via a modal list (`milestonePickerOptions`, first 5 of
  `milestoneOptions`), each with a preview (`getMilestonePreview`).
- **Reminder time** — `HH:mm`; native time picker / web `<input type="time">`.
- **Name** — defaults to `Առանց <type/subtypes>-ի` and auto-updates with subtype
  selection until the user edits it.
- **Daily cost** — optional number (֏), used for saved-money math.
- **Subtypes** — multi-select chips; selecting `Այլ` ("Other") reveals a custom
  subtype input (`addCustomSubtype` / `removeCustomSubtype`).
- **Safety note** — shown for `alcohol` / `drugs`.

## Title/subtype derivation
- `getEffectiveSubtypes` filters out the literal `Այլ` and appends custom values.
- `formatSubtypeTitle` builds `Առանց a, b-ի`.
- `saveTypedCustomSubtype` commits any half-typed custom subtype before continuing
  or creating.

## `createPeriod` flow
1. Commit pending custom subtype; compute final subtype + title.
2. Validate `startDate` matches `YYYY-MM-DD` (else Alert, abort).
3. Build `RecoveryPeriod`; initial streak = `daysBetween(startDate, today())`.
4. `scheduleDailyCheckNotification` (best-effort; failure is non-fatal).
5. `onAdd(newPeriod)`; if native and no notificationId, warn about permissions.
6. Reset all local form state and navigate to `Progress`.

## Layout
The screen's `SafeAreaView` uses `edges={['top', 'left', 'right']}` (bottom edge
excluded). The bottom tab bar already accounts for the bottom safe-area inset, so
applying it here too would leave an empty gap between the fixed footer step
buttons (`fixedStepActions`) and the tab navigation. Keep the bottom edge
excluded so the footer sits flush above the tab bar.

## Keyboard handling
Tracks `isKeyboardOpen` via `Keyboard` listeners; the stage `ScrollView` uses
`automaticallyAdjustKeyboardInsets` + extra bottom padding when open.

## Key dependencies
- `src/data/addictionTypes.ts`
- `src/constants.ts`: `DEFAULT_REMINDER_TIME`, `DEFAULT_MILESTONE_DAYS`, `milestoneOptions`
- `src/utils/date.ts`, `src/utils/reminders.ts`, `src/utils/period.ts`
- `src/utils/notifications.ts`: `scheduleDailyCheckNotification`

## Notes for changes
- The progress label says "Քայլ {stage} / 2" — keep in sync if you add stages.
- Platform branches (web vs ios vs android) exist for every picker; update all.
