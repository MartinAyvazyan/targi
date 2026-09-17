# Spec: Styling / Theme

## File

- `src/theme/styles.ts` — a single exported `StyleSheet.create({...})` object

## Why one shared StyleSheet

Many style keys are shared across screens (`screen`, `content`, `eyebrow`,
`title`, `body`, `panelTitle`, `panelText`, `cardTitleBlock`, `nextButtonFull`,
`backButton`, ...). A single `styles` object avoids duplication and keeps visual
consistency. Import it everywhere as:

```ts
import { styles } from '../theme/styles';
```

## Naming convention

Keys are grouped by screen/feature prefix:

- `home*` — Home screen
- `summary*`, `healthInsight*` — Home summary/insight cards
- `stage*`, `option*`, `subtype*`, `milestone*`, `date*`, `web*` — Add wizard
- `detail*`, `health*`, `metric*`, `card*` — Progress list/detail
- `modal*`, `check*`, `keep*`, `miss*` — check-in modal
- `onboarding*` — onboarding
- `undo*` — undo snackbar
- `tab*` — bottom tab bar

Generic/shared keys have no prefix (`screen`, `content`, `title`, `body`, ...).

## Palette (informal)

- Background: `#f6f4ee`
- Primary / accent: `#0f766e` (teal)
- Money accent: `#e08a3c`
- Danger: `#be123c`
- Warning: `#c2410c`
- Muted text/placeholder: `#6b7280` / `#8a8f98`

## Conventions

- Use existing keys before adding new ones; many layouts are reusable.
- New keys: follow the screen-prefix naming above.
- Inline style objects are only used for dynamic values (e.g. progress bar
  `width: \`${pct}%\``); everything static belongs in the StyleSheet.

## Possible future refactor

If the file grows much larger, split into per-feature style modules
(`theme/home.ts`, `theme/add.ts`, ...) plus a `theme/shared.ts`, and re-export a
combined `styles`. Not done yet because the heavy cross-screen sharing makes a
single file simpler and lower-risk.
