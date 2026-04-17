## ADDED Requirements

### Requirement: Wind level categories and thresholds
The system SHALL classify a windspeed (in m/s) into one of the following named levels based on defined thresholds:

| Level        | Condition       | Label        | Color style    |
|--------------|-----------------|--------------|----------------|
| `very-light` | < 5 m/s         | "very light" | grey / slate   |
| `light`      | ≥ 5 and < 7 m/s | "light"      | blue           |
| (existing levels above 7 m/s remain unchanged)

The `WindLevel` type SHALL include `'very-light'` as a valid variant.

#### Scenario: Windspeed below 5 m/s is classified as very-light
- **WHEN** `getWindLevel` is called with a value less than 5
- **THEN** it returns `'very-light'`

#### Scenario: Windspeed of exactly 5 m/s is classified as light
- **WHEN** `getWindLevel` is called with the value `5`
- **THEN** it returns `'light'`

#### Scenario: Windspeed of 6 m/s is classified as light
- **WHEN** `getWindLevel` is called with the value `6`
- **THEN** it returns `'light'`

#### Scenario: Windspeed of exactly 7 m/s is not classified as light
- **WHEN** `getWindLevel` is called with the value `7`
- **THEN** it does NOT return `'light'`

### Requirement: Wind level color assignment
The system SHALL provide a color/style mapping for each wind level. The `very-light` level SHALL use grey or slate Tailwind classes. The `light` level SHALL use blue Tailwind classes.

#### Scenario: Very-light level returns grey/slate color classes
- **WHEN** the color mapping function is called with `'very-light'`
- **THEN** it returns Tailwind classes consistent with grey or slate styling

#### Scenario: Light level returns blue color classes
- **WHEN** the color mapping function is called with `'light'`
- **THEN** it returns Tailwind classes consistent with blue styling

### Requirement: Wind level display label
The system SHALL provide a human-readable label for each wind level. The `very-light` level SHALL be labelled `"very light"`. The `light` level SHALL be labelled `"light"`.

#### Scenario: Very-light level label
- **WHEN** the label function is called with `'very-light'`
- **THEN** it returns `"very light"`

#### Scenario: Light level label
- **WHEN** the label function is called with `'light'`
- **THEN** it returns `"light"`
