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
- `addPeriod`, `deletePeriod` (with undo),
  `resetPeriod` (with undo), `recordSlip` (confirmation + reset),
  `editPeriod`, `setNextMilestone`, `completeOnboarding`.

## Effects
1. **Load** periods + onboarding flag on mount (then `setLoaded(true)`).
2. **Persist** `periods` to AsyncStorage whenever they change (after load).
3. **Language-aware navigation** — tab labels update from the persisted language context.

## Global overlays (rendered above tabs)
- `UndoSnackbar` — dismissible bottom snackbar with undo and close actions,
  positioned `60 + insets.bottom`
- `OnboardingModal` — first-run flow (see `onboarding.md`)

## Adding a new screen/tab
1. Create the screen in `src/screens/`.
2. Add its route to `RootTabParamList` in `src/types.ts`.
3. Register a `Tab.Screen` in `RootNavigator` and add its tab icon case.
4. Pass only the data + callbacks the screen needs.
