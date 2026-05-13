import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { DatePickerEngine } from '@/engine/DatePickerEngine'

describe('Grid generation', () => {
  it('generates exactly 42 cells', () => {
    const engine = new DatePickerEngine()
    expect(engine.getState().grid.cells).toHaveLength(42)
  })

  it('weekdays are Mon-first', () => {
    const engine = new DatePickerEngine()
    expect(engine.getState().grid.weekdays[0]).toBe('Mon')
    expect(engine.getState().grid.weekdays[6]).toBe('Sun')
  })

  it('leading cells belong to the previous month', () => {
    // May 2025: starts on Thursday (dayOfWeek=4), so 3 leading cells from April
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 1 }),
    })
    const { cells } = engine.getState().grid
    // First cell should be from April 2025
    expect(cells[0]!.isCurrentMonth).toBe(false)
    expect(cells[0]!.date.month).toBe(4)
  })

  it('all current-month cells have isCurrentMonth = true', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 1 }),
    })
    const current = engine.getState().grid.cells.filter((c) => c.isCurrentMonth)
    expect(current).toHaveLength(31) // May has 31 days
  })

  it('trailing cells belong to the next month', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 1 }),
    })
    const { cells } = engine.getState().grid
    const last = cells[41]!
    expect(last.isCurrentMonth).toBe(false)
    expect(last.date.month).toBe(6)
  })

  it('February 2024 (leap year) has 29 current-month cells', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2024, month: 2, day: 1 }),
    })
    const current = engine.getState().grid.cells.filter((c) => c.isCurrentMonth)
    expect(current).toHaveLength(29)
  })

  it('February 2023 (non-leap) has 28 current-month cells', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2023, month: 2, day: 1 }),
    })
    const current = engine.getState().grid.cells.filter((c) => c.isCurrentMonth)
    expect(current).toHaveLength(28)
  })

  it('first cell is on a Monday when month starts on Monday', () => {
    // July 2024 starts on a Monday
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2024, month: 7, day: 1 }),
    })
    const first = engine.getState().grid.cells[0]!
    expect(first.isCurrentMonth).toBe(true)
    expect(first.date.day).toBe(1)
    expect(first.date.dayOfWeek).toBe(1) // Mon=1
  })

  it('marks today cell with isToday = true', () => {
    const today = Temporal.Now.plainDateISO()
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: today.year, month: today.month, day: 1 }),
    })
    const todayCell = engine.getState().grid.cells.find((c) => c.isToday)
    expect(todayCell).toBeDefined()
    expect(todayCell!.date.equals(today)).toBe(true)
  })
})

describe('Navigation', () => {
  it('goToNextMonth advances viewMonth by one', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 3, day: 1 }),
    })
    engine.goToNextMonth()
    expect(engine.getState().viewMonth.month).toBe(4)
    expect(engine.getState().viewMonth.year).toBe(2025)
  })

  it('goToPrevMonth goes back one month', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 3, day: 1 }),
    })
    engine.goToPrevMonth()
    expect(engine.getState().viewMonth.month).toBe(2)
  })

  it('goToNextMonth wraps December → January and increments year', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2024, month: 12, day: 1 }),
    })
    engine.goToNextMonth()
    expect(engine.getState().viewMonth.month).toBe(1)
    expect(engine.getState().viewMonth.year).toBe(2025)
  })

  it('goToPrevMonth wraps January → December and decrements year', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 1, day: 1 }),
    })
    engine.goToPrevMonth()
    expect(engine.getState().viewMonth.month).toBe(12)
    expect(engine.getState().viewMonth.year).toBe(2024)
  })

  it('goToNextYear advances year by 1', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2024, month: 6, day: 1 }),
    })
    engine.goToNextYear()
    expect(engine.getState().viewMonth.year).toBe(2025)
    expect(engine.getState().viewMonth.month).toBe(6)
  })

  it('goToPrevYear goes back one year', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2024, month: 6, day: 1 }),
    })
    engine.goToPrevYear()
    expect(engine.getState().viewMonth.year).toBe(2023)
  })

  it('rebuilds the grid after navigation', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 1, day: 1 }),
    })
    const gridBefore = engine.getState().grid.cells
    engine.goToNextMonth()
    const gridAfter = engine.getState().grid.cells
    expect(gridBefore).not.toBe(gridAfter)
  })
})

describe('Selection', () => {
  it('selectDate marks the correct cell as isSelected', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 1 }),
    })
    const target = Temporal.PlainDate.from({ year: 2025, month: 5, day: 15 })
    engine.selectDate(target)
    const selected = engine.getState().grid.cells.find((c) => c.isSelected)
    expect(selected).toBeDefined()
    expect(selected!.date.day).toBe(15)
  })

  it('selectDate updates inputValue', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 1 }),
    })
    engine.selectDate(Temporal.PlainDate.from({ year: 2025, month: 5, day: 15 }))
    expect(engine.getState().inputValue).not.toBe('')
  })

  it('clearSelection nulls selectedDate and clears inputValue', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 10 }),
    })
    engine.clearSelection()
    expect(engine.getState().selectedDate).toBeNull()
    expect(engine.getState().inputValue).toBe('')
  })

  it('only one cell is selected at a time', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 1 }),
    })
    engine.selectDate(Temporal.PlainDate.from({ year: 2025, month: 5, day: 10 }))
    engine.selectDate(Temporal.PlainDate.from({ year: 2025, month: 5, day: 20 }))
    const selected = engine.getState().grid.cells.filter((c) => c.isSelected)
    expect(selected).toHaveLength(1)
    expect(selected[0]!.date.day).toBe(20)
  })
})

describe('Open/close/toggle', () => {
  it('initial state has isOpen = false', () => {
    const engine = new DatePickerEngine()
    expect(engine.getState().isOpen).toBe(false)
  })

  it('open() sets isOpen to true', () => {
    const engine = new DatePickerEngine()
    engine.open()
    expect(engine.getState().isOpen).toBe(true)
  })

  it('close() sets isOpen to false', () => {
    const engine = new DatePickerEngine()
    engine.open()
    engine.close()
    expect(engine.getState().isOpen).toBe(false)
  })

  it('toggle() flips isOpen', () => {
    const engine = new DatePickerEngine()
    engine.toggle()
    expect(engine.getState().isOpen).toBe(true)
    engine.toggle()
    expect(engine.getState().isOpen).toBe(false)
  })
})

describe('GetState() snapshot', () => {
  it('returns a new object on each call', () => {
    const engine = new DatePickerEngine()
    const s1 = engine.getState()
    const s2 = engine.getState()
    expect(s1).not.toBe(s2)
  })

  it('cells array is a new reference each call', () => {
    const engine = new DatePickerEngine()
    const cells1 = engine.getState().grid.cells
    const cells2 = engine.getState().grid.cells
    expect(cells1).not.toBe(cells2)
  })

  it('mutating returned cells does not affect engine state', () => {
    const engine = new DatePickerEngine()
    const state = engine.getState()
    state.grid.cells.length = 0
    expect(engine.getState().grid.cells).toHaveLength(42)
  })
})

describe('Constructor with initialDate', () => {
  it('pre-selects the initialDate and marks it in the grid', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 7 }),
    })
    const selected = engine.getState().grid.cells.find((c) => c.isSelected)
    expect(selected).toBeDefined()
    expect(selected!.date.day).toBe(7)
  })

  it('sets viewMonth to the initialDate month', () => {
    const engine = new DatePickerEngine({
      initialDate: Temporal.PlainDate.from({ year: 2025, month: 5, day: 7 }),
    })
    expect(engine.getState().viewMonth.year).toBe(2025)
    expect(engine.getState().viewMonth.month).toBe(5)
  })
})
