# Spec: Home (Today) Screen

`src/screens/HomeScreen.tsx` is the calm daily landing screen. It provides the
Armenian/English picker, a start CTA, automatic day totals for each journey, a
localized health insight, a short practical support message, and emergency help.

Each active journey has one manual action: `Record a lapse` / `Խախտել`. The action
is intentionally compact, with an expanded invisible hit area so it remains easy
to tap without dominating the journey card. There is no daily confirmation and no
reminder state. `getCurrentRunDays` derives the
counter from `startDate` every time the app renders.
