## Why

The current windspeed display treats all sub-7 m/s conditions as a single "light" category, but windspeeds in the 5–6 m/s range are meaningfully different from near-zero conditions. Splitting this range improves at-a-glance readability for windsurfers assessing marginal conditions.

## What Changes

- Introduce a new `very-light` wind level for windspeed < 5 m/s (relabelling what was previously the lower end of `light`)
- Rename the existing `light` level to cover 5–6 m/s only, displayed in blue
- Windspeed < 5 m/s is now labelled "very light" (retains grey/slate styling)
- Windspeed 5–6 m/s is labelled "light" and displayed in blue

## Capabilities

### New Capabilities
- `windspeed-levels`: Definition of wind level categories, thresholds, labels, and color assignments — formalising what currently lives in `frontend/src/utils/wind.ts`

### Modified Capabilities
<!-- No existing specs to modify — this is the first spec for this system -->

## Impact

- `frontend/src/utils/wind.ts`: Add `very-light` level; update `getWindLevel` threshold; add blue color classes for `light`
- `frontend/src/pages/OverviewPage.tsx`: No direct changes needed (consumes `wind.ts` functions)
- `frontend/src/pages/SpotDetailPage.tsx`: No direct changes needed (consumes `wind.ts` functions)
- `WindLevel` type: Add `'very-light'` variant
