# Spec: Data Model & Persistence

## Files
- `src/types.ts` — type definitions
- `src/constants.ts` — storage keys + defaults
- `src/utils/period.ts` — derived values + `normalizePeriod`
- `src/utils/date.ts` — date-key helpers
- Owner of persisted state: `src/navigation/RootNavigator.tsx`

## Core type: `RecoveryPeriod`
One tracked recovery effort. Stored as an array under AsyncStorage key
`recovery-periods-v1` (`PERIODS_KEY`).

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Unique id (`Date.now()` at creation) |
| `addictionTypeId` | string | FK into `addictionTypes` (`smoking`, `alcohol`, ...) |
| `subtype` | string | Comma-joined subtype label(s), or `Ընդհանուր` |
| `title` | string | User-facing name, e.g. `Առանց ծխախոտի` |
| `originalStartDate` | date-key | First-ever start (kept across resets) |
| `startDate` | date-key | Current run start (changes on reset/slip) |
| `createdAt` | ISO string | Creation timestamp; used for sort order |
| `bestStreak` | number | Longest run ever (days) |
| `currentStreak` | number | Legacy cached value; current days are derived from dates |
| `totalCleanDays` | number | Legacy cached cumulative days |
| `cleanDaysBeforeCurrentRun` | number? | Completed days before the current run |
| `relapses` | number | Count of resets/slips |
| `dailyCost` | number | Optional money saved per clean day (֏) |
| `currentMilestoneDays` | number | Active milestone target (days) |
| `completedMilestones` | number[] | Milestone day-targets already reached |

## Other types
- `AddictionType` — catalog entry (`src/data/addictionTypes.ts`).
- `RootTabParamList` — navigation param list (`Home | Add | Progress`).
- `UndoState` — `{ message, actionLabel, onUndo }` for the undo snackbar.
- `IoniconName` — valid Ionicons name (typed from the icon component).

## Dates
Stored as `YYYY-MM-DD` "date keys" (local time), never `Date` objects.
Use helpers in `src/utils/date.ts`:
- `today()`, `toDateKey(date)`, `parseDateKey(key)`
- `addDays(key, n)`, `daysBetween(start, end)`
- `formatDate(key, language)`, `formatDateHy(key)`, `dayOfYear(date)`

## Derived values (`src/utils/period.ts`)
Never recompute these inline — reuse:
- `getCurrentRunDays`, `getTotalCleanDays`, `getSavedMoney`
- `getHealthImprovements`, `getCurrentHealthInsight`, `getMilestonePreview`
- `getHealthIcon`, `getNextMilestoneOptions`
- `getType(typeId, language)` — resolve a localized `AddictionType`

Current run days are calculated automatically from `startDate` and today's date.
Recording a lapse moves the completed current run into `cleanDaysBeforeCurrentRun`
and resets `startDate`; there is no daily confirmation flow.

## Normalization & migrations
`normalizePeriod` backfills missing/older fields when loading from storage,
so partially-shaped persisted data stays valid. **If you change the
`RecoveryPeriod` shape:**
1. Update `RecoveryPeriod` in `src/types.ts`.
2. Add backfill logic in `normalizePeriod`.
3. If the change is breaking, bump `PERIODS_KEY` to `-v2` and migrate.
