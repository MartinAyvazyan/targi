# Targi — Architecture & Project Structure

Targi is an Expo / React Native app (Armenian and English UI) that helps users track
recovery streaks from different addictions: pick what you want to quit, start a
"recovery period", hit milestones, and watch health + money
benefits accrue.

This document is the entry point for any developer or AI agent working on the
codebase. Each feature has its own spec file in this folder — read the relevant
spec before changing a feature.

> **Keep these specs current.** Updating the matching spec is part of "done" for
> any code change, so the docs never drift from the code. This is enforced by the
> always-applied Cursor rule `.cursor/rules/keep-docs-updated.mdc`, which maps
> each source file to the spec it must update. See
> ["Updating these docs"](#updating-these-docs) below.

## Tech stack

- **Expo** `~54` / **React Native** `0.81` / **React** `19`
- **@react-navigation/bottom-tabs** for navigation (3 tabs: Home, Add, Progress)
- **@react-native-async-storage/async-storage** for persistence
- **@react-native-community/datetimepicker** for date pickers
- TypeScript in `strict` mode

## Folder structure

```
.
├── App.tsx                     # Root providers + RootNavigator
├── index.ts                    # Expo entry (registerRootComponent)
└── src/
    ├── types.ts                # Shared TypeScript types (RecoveryPeriod, etc.)
    ├── constants.ts            # Storage keys + milestone defaults
    ├── i18n.tsx                # Persisted Armenian/English language context
    ├── data/                   # Static content (Armenian copy & catalogs)
    │   ├── addictionTypes.ts   # Catalog of addiction types + subtypes
    │   ├── healthImprovements.ts # Per-type health-benefit timeline
    │   └── motivation.ts       # Localized rotating support messages
    ├── utils/                  # Pure logic, no JSX
    │   ├── date.ts             # Date-key helpers (toDateKey, daysBetween, ...)
    │   ├── money.ts            # Money formatting + comparison copy
    │   └── period.ts           # RecoveryPeriod derived values + normalization
    ├── theme/
    │   └── styles.ts           # Single shared StyleSheet (`styles`)
    ├── screens/                # Tab screens
    │   ├── HomeScreen.tsx      # "Today" tab
    │   ├── AddScreen.tsx       # "Start" tab (2-step create wizard)
    │   └── ProgressScreen.tsx  # "Progress" tab (list + detail routing)
    ├── components/             # Reusable / sub-screen components
    │   ├── ProgressDetailPage.tsx
    │   ├── OnboardingModal.tsx
    │   └── UndoSnackbar.tsx
    ├── navigation/
    │   └── RootNavigator.tsx   # App state owner + tab navigator + global modals
    └── docs/                   # Feature specs (this folder)
```

## Architectural conventions

- **Single source of truth for state.** `RootNavigator` owns the `periods` array
  and all mutations (`addPeriod`, `resetPeriod`, `deletePeriod`,
  `editPeriod`, `setNextMilestone`). Screens are presentational and receive data
  + callbacks via props. Keep mutation logic in `RootNavigator`.
- **No business logic in JSX files.** Derived values (streaks, saved money,
  health insights) live in `src/utils/period.ts`. Reuse those helpers instead of
  re-deriving inline.
- **Localized catalog copy lives in `src/data/`.** When adding/editing user-facing
  catalog text, edit data files, not components.
- **Styling is one shared `StyleSheet`** in `src/theme/styles.ts`, imported as
  `import { styles } from '../theme/styles'`. Style keys are namespaced by screen
  prefix (e.g. `home*`, `detail*`, `onboarding*`). See `styling.md`.
- **Dates are stored as `YYYY-MM-DD` string "date keys"**, never `Date` objects.
  Always go through `src/utils/date.ts`.
- **Persistence keys are versioned** (`recovery-periods-v1`). Bump the version
  and add a migration if the `RecoveryPeriod` shape changes.

## Feature specs

| Spec | Covers |
| --- | --- |
| [`data-model.md`](./data-model.md) | `RecoveryPeriod`, persistence, normalization |
| [`navigation.md`](./navigation.md) | Tabs, app state ownership, global modals |
| [`home.md`](./home.md) | "Today" screen + automatic counters |
| [`add-period.md`](./add-period.md) | Create-period wizard |
| [`progress.md`](./progress.md) | Progress list + detail page |
| [`onboarding.md`](./onboarding.md) | First-run onboarding |
| [`styling.md`](./styling.md) | Theme / StyleSheet conventions |

## Updating these docs

Specs must be updated **in the same change set** as the code they describe.
The rule `.cursor/rules/keep-docs-updated.mdc` (alwaysApply) defines the full
source-file → spec mapping and a completion checklist. In short:

- Change a screen/component/util → update that feature's spec (props, flows,
  dependencies, "notes for changes").
- Add/move/delete a file or feature → update the folder tree + "Feature specs"
  table here in `README.md`, and add a new `<feature>.md` for new features.
- Introduce a new convention → record it under "Architectural conventions".

A change is not complete until the affected docs match the code.

## Local commands

```bash
npm run ios       # run on iOS
npm run android   # run on Android
npm run web       # run on web
npx tsc --noEmit  # typecheck (run before committing)
```
