# Spec: Home ("Today") Screen

## File

- `src/screens/HomeScreen.tsx`

## Purpose

The "Այսօր" (Today) tab: a calm daily landing screen that surfaces today's
check-ins, a start CTA, a summary, a health insight, and a rotating reminder.

## Props

```ts
{
  navigation: BottomTabNavigationProp<RootTabParamList, 'Home'>;
  onKeep: (id: string) => void;   // mark a period clean today
  onSlip: (id: string) => void;   // mark a hard day (resets streak)
  periods: RecoveryPeriod[];      // sorted periods from RootNavigator
}
```

## Sections (top → bottom)

1. **Header** — eyebrow `Targi` + title.
2. **Inline check-in panel** — shown when `hasDueCheckIn` (any period due today).
   Each due period gets "Մաքուր օր էր" (`onKeep`) / "Դժվար օր էր" (`onSlip`).
3. **Start button** — navigates to the `Add` tab.
4. **Summary panel** — active period count, checks pending now, next reminder,
   longest current run.
5. **Health insight card** — current body-change insight for the
   longest-running period (`getCurrentHealthInsight`).
6. **Daily reminder** — deterministic pick from `reminderTexts` by `dayOfYear`.
7. **Help panel** — emergency guidance.

## Responsive behavior

Uses `useWindowDimensions().height` with breakpoints:

- `isCompactHome` = height < 820
- `isTinyHome` = height < 720

These drive `show*` flags so the screen never overflows on small devices. When a
check-in is due on a compact screen, secondary panels are hidden to prioritize
the check-in.

## Layout

The screen's `SafeAreaView` uses `edges={['top', 'left', 'right']}` (bottom edge
excluded) because the bottom tab bar already accounts for the bottom safe-area
inset; applying it here too would leave an empty gap above the tab bar.

## Key dependencies

- `src/utils/period.ts`: `getCurrentRunDays`, `getCurrentHealthInsight`, `isDueForCheckIn`
- `src/utils/date.ts`: `dayOfYear`
- `src/utils/reminders.ts`: `parseReminderTime`, `formatReminderTime`
- `src/data/motivation.ts`: `reminderTexts`

## Notes for changes

- Keep all streak/insight math in `utils`, not inline.
- Preserve the compact/tiny layout guards when adding content.
