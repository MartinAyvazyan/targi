# Spec: Onboarding

## Files

- `src/components/OnboardingModal.tsx` — the 3-slide intro
- `src/navigation/RootNavigator.tsx` — visibility + persistence

## Purpose

A one-time, full-screen 3-slide intro shown on first launch explaining what the
app is, the daily check-in habit, and that slipping is not failure.

## Props

```ts
{
  visible: boolean;
  onComplete: () => void;
}
```

## Behavior

- Local `step` (0..2). Slides defined inline (`icon`, `title`, `body`).
- "Շարունակել" advances; on the last slide the button reads "Սկսենք" and calls
  `onComplete`. A "Հետ" (back) button appears after the first slide.
- Progress dots reflect the current slide.

## Persistence (RootNavigator)

- On load: `showOnboarding = storedOnboarding !== 'done'` using AsyncStorage key
  `targi-onboarding-v1` (`ONBOARDING_KEY`).
- `completeOnboarding()` writes `'done'` and hides the modal.

## Notes for changes

- To force re-onboarding (e.g. major redesign), bump `ONBOARDING_KEY`.
- Keep copy in the component; it's short-form UI text, not a shared catalog.
