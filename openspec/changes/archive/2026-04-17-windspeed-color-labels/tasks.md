## 1. Update WindLevel type and threshold logic

- [x] 1.1 Add `'very-light'` to the `WindLevel` union type in `frontend/src/utils/wind.ts`
- [x] 1.2 Add a named constant `VERY_LIGHT_MAX = 5` in `wind.ts` (avoid magic number in threshold logic)
- [x] 1.3 Update `getWindLevel` so values < 5 return `'very-light'` and values ≥ 5 and < 7 return `'light'`

## 2. Update color and border mappings

- [x] 2.1 Add a `'very-light'` case to `windLevelBg` returning grey/slate classes (e.g. `bg-slate-800 text-slate-500`) — move existing `light` slate classes here
- [x] 2.2 Update the `'light'` case in `windLevelBg` to return blue classes (e.g. `bg-blue-800 text-blue-100`)
- [x] 2.3 Add a `'very-light'` case to `windLevelBorder` (e.g. `border-slate-700`) — move existing `light` border here
- [x] 2.4 Update the `'light'` case in `windLevelBorder` to a blue border class (e.g. `border-blue-500`)

## 3. Fix TypeScript exhaustiveness errors

- [x] 3.1 Run `tsc --noEmit` (or `npm run typecheck`) and fix any switch/if-chain missing the `'very-light'` arm in other files

## 4. Tests

- [x] 4.1 Add unit tests for `getWindLevel` covering the new boundaries: value < 5 → `'very-light'`; value = 5 → `'light'`; value = 6 → `'light'`; value = 7 → not `'light'`
- [x] 4.2 Add unit tests for `windLevelBg` and `windLevelBorder` asserting correct class strings for `'very-light'` and updated `'light'`
- [x] 4.3 Run the full test suite and update any snapshots that capture wind level display

## 5. Verification

- [x] 5.1 Visually verify `OverviewPage` and `SpotDetailPage` render correct label and color for winds < 5 m/s and 5–6 m/s
- [x] 5.2 Confirm the build passes with no TypeScript errors (`npm run build`)
