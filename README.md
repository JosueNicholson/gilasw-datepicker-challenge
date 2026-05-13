# Headless DatePicker

A fully functional DatePicker built for the GilaSoftware technical challenge.
The calendar logic is a zero-dependency TypeScript engine; Vue 3 is purely a rendering layer.

---

## Architecture

### State Management: Engine, Composable, Component

The project is split into three clear layers:

| Layer | File | Knows about |
|---|---|---|
| **Engine** | `src/engine/DatePickerEngine.ts` | Pure TS, zero imports |
| **Bridge** | `src/composables/useDatePicker.ts` | Engine + Vue reactivity |
| **UI** | `src/components/DatePicker/*.vue` | Only the composable |

**How it works:**

1. `DatePickerEngine` is a plain class that owns all calendar state (current view month, selected date, open/closed) as regular class properties. It exposes methods that mutate state and a `getState()` method that returns a snapshot.

2. `useDatePicker` is the only file that imports both the engine and Vue. It holds a single `ref<DatePickerState>` and wraps every engine method:
   ```ts
   const sync = () => { state.value = engine.getState() }
   const goToNextMonth = () => { engine.goToNextMonth(); sync() }
   ```
   This pattern keeps the engine 100% framework-agnostic. It can be used in any JS context.

3. Vue components import the composable and never touch the engine directly. `DatePicker.vue` owns click-outside and keyboard (Esc) listeners; the engine and composable have no DOM awareness.

**Why `getState()` returns a new object each time:** Vue's `ref` detects changes by reference equality at the top level. If the same object were mutated in place, `state.value = engine.getState()` would assign the same reference and Vue would not re-render. Returning a fresh object (with a spread copy of the cells array) guarantees Vue always sees a change.

**Why `v-show` instead of `v-if` on the popover:** `v-if` tears down and recreates the DOM on each open/close. `v-show` keeps the DOM alive, which simplifies focus management and avoids layout flicker.

---

### Temporal API: Observations

The engine uses `Temporal.PlainDate` and `Temporal.PlainYearMonth` exclusively. No legacy `Date` object is used in calendar logic.

**What the engine uses:**

| API | Purpose |
|---|---|
| `Temporal.Now.plainDateISO()` | Get today's date without time zone ambiguity |
| `Temporal.PlainYearMonth.from({ year, month })` | Construct the view month |
| `plainYearMonth.toPlainDate({ day })` | Get any specific day in the month |
| `plainYearMonth.daysInMonth` | How many days a month has |
| `plainDate.add / .subtract` | Date arithmetic for grid leading/trailing cells |
| `plainDate.dayOfWeek` | ISO weekday (Mon=1, Sun=7) |
| `plainDate.equals(other)` | Date comparison without gotchas |
| `plainDate.toLocaleString(locale, options)` | Intl-formatted display string |

**Key advantages over `Date`:**

- **No timezone offset bugs.** The classic `new Date('2025-01-01')` parses as midnight UTC and shifts to Dec 31 in UTC-offset timezones, breaking calendar grids. `Temporal.PlainDate` has no time zone concept. It represents a calendar date only.
- **ISO-correct `dayOfWeek`.** `Date.getDay()` returns 0 for Sunday. `Temporal.PlainDate.dayOfWeek` returns 7 for Sunday (ISO 8601), which makes Monday-first grid alignment trivial: `leadingCount = firstDay.dayOfWeek - 1`.
- **Immutable arithmetic.** `.add()` and `.subtract()` return new values; there is no risk of accidentally mutating a shared date reference.

**Browser support:** Chrome 121+, Firefox 139+, Safari 17.4+. No polyfill is used (that would violate the zero-dependency requirement). The test environment (jsdom) lacks Temporal, so `src/__tests__/setup.ts` provides a minimal hand-written shim covering only the ~10 methods the engine actually calls.

---

## How to Run

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm (bundled with Node)

### Install

```bash
npm install
```

### Development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Unit tests

```bash
npm run test:unit
```

### Type check + production build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
src/
  engine/
    types.ts                 # TypeScript interfaces. The engine's public contract
    DatePickerEngine.ts      # Pure TS calendar logic. Zero framework imports
  composables/
    useDatePicker.ts         # Vue bridge: owns ref<DatePickerState>, syncs after each call
  components/
    DatePicker/
      DatePicker.vue         # Root: input + popover, click-outside, v-model
      CalendarHeader.vue     # Month/year label + prev/next navigation buttons
      CalendarGrid.vue       # 6×7 <table role="grid"> of day cells
  __tests__/
    setup.ts                 # Minimal Temporal shim for jsdom test environment
    DatePickerEngine.spec.ts # Engine unit tests (pure TS, no Vue)
    DatePicker.spec.ts       # Component integration tests
  App.vue                    # Demo page
```
