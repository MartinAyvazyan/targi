# Spec: Progress (List + Detail)

## Files
- `src/screens/ProgressScreen.tsx` — list + routing
- `src/components/ProgressDetailPage.tsx` — single-period detail

## Purpose
The "Ընթացք" (Progress) tab: a list of all recovery periods; tapping one opens an
in-screen detail page (no separate navigator route — controlled by local state).

## ProgressScreen
Props:
```ts
{
  onDelete: (id: string) => void;
  onEdit: (id, updates: Partial<Pick<RecoveryPeriod,'dailyCost'|'title'>>) => void;
  periods: RecoveryPeriod[];
  onReset: (id: string) => void;       // record slip / restart streak
  onSetMilestone: (id, days) => void;
}
```
- Local `selectedPeriodId` decides list vs detail. If a period is selected it
  renders `ProgressDetailPage`, otherwise a `FlatList` of cards.
- Each card shows title, type/subtype, current streak, milestone progress bar,
  remaining days, and saved-money chip.
- Empty state prompts the user to start small.
- `confirmDelete` shows a destructive `Alert` before calling `onDelete`.

## ProgressDetailPage
Props: `period`, `onBack`, `onDelete(period)`, `onEdit`, `onReset`, `onSetMilestone`.

Sections:
1. **Header** — back button + type/subtype + title.
2. **Hero** — current streak in days.
3. **Metric grid** — total clean days, best streak, saved money.
4. **Money insight** — `getMoneyComparison(savedMoney)`.
5. **Milestone** — progress bar + remaining days; when complete, offers next
   milestone options (`getNextMilestoneOptions` → `onSetMilestone`).
6. **Health timeline** — full `getHealthImprovements` list with unlocked state by
   day, plus the "next" upcoming improvement and a medical disclaimer.
7. **Settings** — inline edit (title + daily cost via `onEdit`), start date,
   daily cost, "Խախտել" / "Record a lapse" (`onReset`), and delete.

Editing: local `isEditing` + draft fields, re-synced via `useEffect` on
`period.id/title/dailyCost`. `saveEdits` commits trimmed values.

## Layout
Both `ProgressScreen` and `ProgressDetailPage` use
`SafeAreaView edges={['top', 'left', 'right']}` (bottom edge excluded). The bottom
tab bar already reserves the bottom safe-area inset, so including it here would
leave an empty gap above the tab bar.

## Key dependencies
- `src/utils/period.ts` (all derived values + `getType`)
- `src/utils/money.ts` (`formatMoney`, `getMoneyComparison`)
- `src/utils/date.ts`

## Notes for changes
- `onReset` here is wired to `RootNavigator.recordSlip` (confirm + reset).
- Keep streak/money/health math in `utils`.
