export interface CalendarCell {
  date: Temporal.PlainDate
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
}

export interface CalendarGrid {
  cells: CalendarCell[]
  weekdays: readonly string[]
}

export interface DatePickerState {
  viewMonth: Temporal.PlainYearMonth
  selectedDate: Temporal.PlainDate | null
  grid: CalendarGrid
  isOpen: boolean
  inputValue: string
}

export interface DatePickerOptions {
  initialDate?: Temporal.PlainDate
  locale?: string
}
