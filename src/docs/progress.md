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
- Each card shows title, type/subtype, current streak, capped milestone progress
  (for example `7/7`, never `31/7`), remaining/completed state, an inline delete
  action, and a saved-money chip when spending tracking applies.
- Empty state prompts the user to start small.
- `confirmDelete` shows a destructive `Alert` before calling `onDelete`.

## ProgressDetailPage
Props: `period`, `onBack`, `onDelete(period)`, `onEdit`, `onReset`, `onSetMilestone`.

Sections:
1. **Header** — back button + type/subtype + title.
2. **Hero** — current streak in days.
3. **Metric grid** — total clean days, best streak, and saved money when applicable.
4. **Money insight** — `getMoneyComparison(savedMoney)`; hidden for social media.
5. **Milestone** — progress bar + remaining days; when complete, offers next
   milestone options (`getNextMilestoneOptions` → `onSetMilestone`).
6. **Change timeline** — type-specific milestones through day 365, with live
   reached/total progress, days until the next stage, deeper next-stage context,
   unlocked state by day, a post-year state, and a cautious medical disclaimer.
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

Timeline copy is intentionally cautious and distinguishes established physical
changes from behavioral reflection points where long-term causal evidence is
limited. Research basis:

- [CDC — Benefits of Quitting Smoking](https://www.cdc.gov/tobacco/about/benefits-of-quitting.html)
- [NIAAA — Recovery definitions](https://www.niaaa.nih.gov/research/niaaa-recovery-from-alcohol-use-disorder/definitions)
- [NIAAA — Brain in addiction and recovery](https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/neuroscience-brain-addiction-and-recovery)
- [NIDA — Drugs, Brains, and Behavior](https://nida.nih.gov/sites/default/files/soa_2014.pdf)
- [PubMed — Gambling disorder 12-month follow-up](https://pubmed.ncbi.nlm.nih.gov/28365465/)
- [PubMed — One-week social-media break RCT](https://pubmed.ncbi.nlm.nih.gov/35512731/)
- [PubMed — Three-week screen-time reduction RCT](https://pubmed.ncbi.nlm.nih.gov/39985031/)
