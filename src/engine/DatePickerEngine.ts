import type { CalendarCell, CalendarGrid, DatePickerOptions, DatePickerState } from './types'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const GRID_CELL_COUNT = 6 * 7
const DEFAULT_LOCALE = 'en-US'

export class DatePickerEngine {
  private viewMonth: Temporal.PlainYearMonth
  private selectedDate: Temporal.PlainDate | null
  private locale: string
  private isOpen: boolean
  private currentGrid: CalendarGrid

  constructor(options?: DatePickerOptions) {
    const today = Temporal.Now.plainDateISO()
    this.viewMonth = options?.initialDate
      ? Temporal.PlainYearMonth.from({
          year: options.initialDate.year,
          month: options.initialDate.month,
        })
      : Temporal.PlainYearMonth.from({ year: today.year, month: today.month })
    this.selectedDate = options?.initialDate ?? null
    this.locale = options?.locale ?? DEFAULT_LOCALE
    this.isOpen = false
    this.currentGrid = this.buildGrid()
  }

  private buildGrid(): CalendarGrid {
    const today = Temporal.Now.plainDateISO()
    const firstDay = this.viewMonth.toPlainDate({ day: 1 })

    // Monday-first grid
    const leadingCount = firstDay.dayOfWeek - 1
    const daysInMonth = this.viewMonth.daysInMonth

    const cells: CalendarCell[] = []

    // previous month cells
    for (let i = leadingCount - 1; i >= 0; i--) {
      const date = firstDay.subtract({ days: i + 1 })
      cells.push(this.makeCell(date, false, today))
    }

    // current month cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.viewMonth.toPlainDate({ day })
      cells.push(this.makeCell(date, true, today))
    }

    // next month cells
    const lastDay = this.viewMonth.toPlainDate({ day: daysInMonth })
    const trailingCount = GRID_CELL_COUNT - cells.length
    for (let i = 1; i <= trailingCount; i++) {
      const date = lastDay.add({ days: i })
      cells.push(this.makeCell(date, false, today))
    }

    return { cells, weekdays: WEEKDAYS }
  }

  private makeCell(
    date: Temporal.PlainDate,
    isCurrentMonth: boolean,
    today: Temporal.PlainDate,
  ): CalendarCell {
    return {
      date,
      isCurrentMonth,
      isToday: date.equals(today),
      isSelected: this.selectedDate ? date.equals(this.selectedDate) : false,
      isDisabled: false,
    }
  }

  private formatInputValue(date: Temporal.PlainDate | null): string {
    if (!date) return ''
    return date.toLocaleString(this.locale, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  getState(): DatePickerState {
    return {
      viewMonth: this.viewMonth,
      selectedDate: this.selectedDate,
      grid: { cells: [...this.currentGrid.cells], weekdays: this.currentGrid.weekdays },
      isOpen: this.isOpen,
      inputValue: this.formatInputValue(this.selectedDate),
    }
  }

  goToNextMonth(): void {
    this.viewMonth = this.viewMonth.add({ months: 1 })
    this.currentGrid = this.buildGrid()
  }

  goToPrevMonth(): void {
    this.viewMonth = this.viewMonth.subtract({ months: 1 })
    this.currentGrid = this.buildGrid()
  }

  goToNextYear(): void {
    this.viewMonth = this.viewMonth.add({ years: 1 })
    this.currentGrid = this.buildGrid()
  }

  goToPrevYear(): void {
    this.viewMonth = this.viewMonth.subtract({ years: 1 })
    this.currentGrid = this.buildGrid()
  }

  selectDate(date: Temporal.PlainDate): void {
    this.selectedDate = date
    this.currentGrid = this.buildGrid()
  }

  clearSelection(): void {
    this.selectedDate = null
    this.currentGrid = this.buildGrid()
  }

  open(): void {
    this.isOpen = true
  }

  close(): void {
    this.isOpen = false
  }

  toggle(): void {
    this.isOpen = !this.isOpen
  }
}
