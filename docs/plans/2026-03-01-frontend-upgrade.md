# Frontend Upgrade Spec (v1)

## Goals
- Strong dynasty identity per screen: palettes, textures, ambient motion.
- Higher game feel: visible HUD (coins/streak/energy), richer challenge flow.
- Maintain Vite/React/TS stack performance; respect `prefers-reduced-motion`.

## Visual System
- Palette tokens per dynasty mapped to CSS vars: primary/secondary/bg texture tint.
- Background layers: gradient base + parallax pattern (SVG) + particle FX (lanterns/petals) controlled via `BackgroundFX` props.
- Typography: keep `font-serif`/`font-kai`; accent headings use `font-serif` + dynasty primary.

## Components
- `BackgroundFX` (new, in `src/features/layout`): renders gradient + parallax motifs + optional particle animation; accepts `tone`, `intensity`, `motionEnabled`.
- `HUDBar` (new): top sticky bar with crest, dynasty label, coins, streak, energy, Theme toggle, and nav home.
- `DynastyBadge` (new): circular emblem with dynasty initial + glow; reusable in map cards.

## Screens
- `AppLayout`: wrap pages with `BackgroundFX` and `HUDBar`; provide motion toggle from user settings (prefers-reduced-motion fallback).
- `DynastyMap`: horizontal scroll cards upgraded with badges, progress rings, “boss” marker, subtle tilt hover.
- `ChallengePage`: add ambient background, progress/combo bar, streak/life pills; result card uses dynasty crest and confetti burst.

## Gamification Hooks
- `useStreak` (new): track daily streak and last-play date (local for v1; Supabase-ready interface).
- `useEnergy` (new): simple lives (max 5) that refill on timer or via coin spend; UI shows pills and disabled state when empty.

## Performance & Accessibility
- Respect `prefers-reduced-motion`: disable particles, keep gradient only.
- Lazy-load heavy SVG textures per dynasty; shared base shapes in `src/assets/dynasties/<name>/`.
- Keep ARIA labels on interactive HUD controls; maintain keyboard focus order.
