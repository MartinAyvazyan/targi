# Spec: Onboarding

`OnboardingModal` is a three-page first-run introduction. Copy is localized via
`useLanguage`, and the language picker is available at the top. Pages use a
horizontal, paging-enabled `FlatList`, so users can swipe or use Back/Continue.
The page indicator stays directly below the slide content and the pager height adapts
to shorter phone screens so it does not drift into the bottom action area.
The language picker uses the device's top safe-area inset plus a Dynamic Island-safe
minimum, keeping it below camera and sensor cutouts in the full-screen modal.
The first-page action uses the same 50-point height as the split Back/Continue actions.
After the third slide, one more forward swipe completes onboarding exactly like the
`Let's start` button; the extra completion page is intentionally invisible.

The copy explains automatic day counting and the explicit lapse action. It does
not mention daily confirmation or reminders. Completion is persisted under
`targi-onboarding-v2`; the v2 key intentionally shows this redesigned onboarding
once to existing users.
