## Context

The windspeed classification logic lives entirely in `frontend/src/utils/wind.ts`. It maps raw m/s values to a `WindLevel` type, which drives both the display label and the color styling across `OverviewPage` and `SpotDetailPage`.

Currently, everything below 7 m/s falls into a single `light` category. Windsurfers reading the UI cannot distinguish near-zero from marginal (5–6 m/s) conditions at a glance. This change splits that range by inserting a `very-light` level for < 5 m/s, while restricting `light` to 5–6 m/s and giving it a blue color to signal that conditions are approaching usable.

No backend changes are required — windspeed values are served as raw numbers and the classification is purely frontend.

## Goals / Non-Goals

**Goals:**
- Add a `very-light` wind level (< 5 m/s) with grey/slate styling
- Restrict `light` to 5–6 m/s and assign blue color classes
- Keep all consuming pages (`OverviewPage`, `SpotDetailPage`) working without modification

**Non-Goals:**
- Changes to any levels above 7 m/s
- Internationalisation / translation of the new label
- Changes to backend data models or API contracts

## Decisions

### Extend the union type rather than replacing it

`WindLevel` is a string union type. Adding `'very-light'` as a new member is the safest approach: TypeScript exhaustiveness checks will surface any switch/if-chain that doesn't handle the new value at compile time, making missed cases impossible to ship silently.

**Alternative considered**: a numeric enum. Rejected — existing code and tests use string literals throughout; a numeric enum would require a broader refactor for no functional benefit.

### Threshold boundary: < 5 m/s for `very-light`

The proposal specifies exactly this boundary. It is encoded as a constant in `wind.ts` (e.g. `VERY_LIGHT_MAX = 5`) so it can be referenced in tests and the spec without magic numbers.

**Alternative considered**: ≤ 4 m/s. Rejected — not aligned with the proposal and would leave 4–5 m/s unclassified.

### Color: blue Tailwind classes for `light`

The existing pattern in `wind.ts` returns Tailwind utility class strings. Blue classes (e.g. `text-blue-500 bg-blue-100`) are consistent with how other levels are styled. No new styling mechanism is needed.

## Risks / Trade-offs

- **Missed exhaustiveness check** → Any `switch` on `WindLevel` that lacks a `very-light` arm will produce a TypeScript error at build time. This is a feature, not a risk, but may require touching additional files not listed in the proposal's impact section.
- **Snapshot / visual regression tests** → If the project has screenshot or snapshot tests for the wind display, they will need updating. → Mitigation: run existing test suite after the change and update snapshots intentionally.

## Migration Plan

1. Update `WindLevel` union type to include `'very-light'`
2. Update `getWindLevel` threshold logic in `wind.ts`
3. Add color/label mappings for `very-light` and update `light` mappings
4. Fix any TypeScript exhaustiveness errors surfaced in other files
5. Update / add unit tests for the new threshold boundary
6. Deploy as a frontend-only change — no data migration required, no rollback strategy needed beyond reverting the commit

## Open Questions

- Are there any snapshot or visual regression tests that capture the wind color display? (Check CI configuration.)
- Should `very-light` have a distinct icon or badge, or label-only differentiation? (Proposal implies label + color only — assume no icon change unless designer confirms.)
