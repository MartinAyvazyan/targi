# Spec: Navigation & App State

## Files

- `App.tsx` — root, wraps everything in `SafeAreaProvider`
- `src/navigation/RootNavigator.tsx` — the heart of the app

## Tabs

Bottom tab navigator (`RootTabParamList`), `initialRouteName="Add"`:

- `Home` → "Այսօր" → `HomeScreen`
- `Add` → "Սկսել" → `AddScreen`
- `Progress` → "Ընթացք" → `ProgressScreen`

Tab icons are chosen in `screenOptions.tabBarIcon` by route name + focus state.
Headers are hidden (`headerShown: false`). Tab bar styling: `styles.tabBar`,
`styles.tabLabel`.

## State ownership

`RootNavigator` is the single owner of app state and all `periods` mutations.
Screens are presentational; they get data + callbacks via render props.

State:

- `periods` — array of `RecoveryPeriod` (persisted)
- `loaded` — finished initial AsyncStorage load
- `showOnboarding`, `showCheckIn`, `targetCheckInPeriodId`
- `undo` (+ `undoTimerRef`) — undo snackbar state

Derived (memoized): `sortedPeriods` (newest `createdAt` first),
`checkInPeriods`, `visibleCheckInPeriods`.

## Mutations (keep all here)

- `addPeriod`, `deletePeriod` (with undo), `keepToday`,
  `resetPeriod` (with undo), `recordSlip` (reset + reassurance alert),
  `editPeriod`, `setNextMilestone`, `completeOnboarding`.

## Effects

1. **Load** periods + onboarding flag on mount (then `setLoaded(true)`).
2. **Persist** `periods` to AsyncStorage whenever they change (after load).
3. **Notification routing** — open the right check-in when launched/resumed from
   a notification or when the app becomes active (see `notifications.md`).
4. **Notification sync** — reconcile scheduled OS notifications with current
   periods (see `notifications.md`).

## Global overlays (rendered above tabs)

- `DailyCheckInModal` — daily check-in (see `daily-check-in.md`)
- `UndoSnackbar` — bottom snackbar, positioned `88 + insets.bottom`
- `OnboardingModal` — first-run flow (see `onboarding.md`)

## Adding a new screen/tab

1. Create the screen in `src/screens/`.
2. Add its route to `RootTabParamList` in `src/types.ts`.
3. Register a `Tab.Screen` in `RootNavigator` and add its tab icon case.
4. Pass only the data + callbacks the screen needs.
