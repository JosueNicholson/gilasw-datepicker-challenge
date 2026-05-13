// Temporal shim for jsdom

class PlainDate {
  readonly year: number
  readonly month: number
  readonly day: number

  constructor(year: number, month: number, day: number) {
    this.year = year
    this.month = month
    this.day = day
  }

  static from(arg: { year: number; month: number; day: number } | string): PlainDate {
    if (typeof arg === 'string') {
      const [y, m, d] = arg.split('-').map(Number)
      return new PlainDate(y!, m!, d!)
    }
    return new PlainDate(arg.year, arg.month, arg.day)
  }

  // ISO 8601: Mon=1 to Sun=7
  get dayOfWeek(): number {
    const d = new Date(this.year, this.month - 1, this.day)
    const dow = d.getDay() // 0=Sun, 1=Mon to 6=Sat
    return dow === 0 ? 7 : dow
  }

  get daysInMonth(): number {
    return new Date(this.year, this.month, 0).getDate()
  }

  add(duration: { days?: number; months?: number; years?: number }): PlainDate {
    let { year, month, day } = this
    year += duration.years ?? 0
    month += duration.months ?? 0
    day += duration.days ?? 0

    const date = new Date(year, month - 1, day)
    return new PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  subtract(duration: { days?: number; months?: number; years?: number }): PlainDate {
    return this.add({
      days: -(duration.days ?? 0),
      months: -(duration.months ?? 0),
      years: -(duration.years ?? 0),
    })
  }

  equals(other: PlainDate): boolean {
    return this.year === other.year && this.month === other.month && this.day === other.day
  }

  toString(): string {
    return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`
  }

  toLocaleString(locale: string, options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(this.year, this.month - 1, this.day)
    return date.toLocaleDateString(locale, options)
  }

  toPlainYearMonth(): PlainYearMonth {
    return new PlainYearMonth(this.year, this.month)
  }
}

class PlainYearMonth {
  readonly year: number
  readonly month: number

  constructor(year: number, month: number) {
    this.year = year
    this.month = month
  }

  static from(arg: { year: number; month: number } | string): PlainYearMonth {
    if (typeof arg === 'string') {
      const [y, m] = arg.split('-').map(Number)
      return new PlainYearMonth(y!, m!)
    }
    return new PlainYearMonth(arg.year, arg.month)
  }

  get daysInMonth(): number {
    return new Date(this.year, this.month, 0).getDate()
  }

  toPlainDate(arg: { day: number }): PlainDate {
    return new PlainDate(this.year, this.month, arg.day)
  }

  add(duration: { months?: number; years?: number }): PlainYearMonth {
    let { year, month } = this
    year += duration.years ?? 0
    month += duration.months ?? 0

    const date = new Date(year, month - 1, 1)
    return new PlainYearMonth(date.getFullYear(), date.getMonth() + 1)
  }

  subtract(duration: { months?: number; years?: number }): PlainYearMonth {
    return this.add({
      months: -(duration.months ?? 0),
      years: -(duration.years ?? 0),
    })
  }

  equals(other: PlainYearMonth): boolean {
    return this.year === other.year && this.month === other.month
  }

  toString(): string {
    return `${this.year}-${String(this.month).padStart(2, '0')}`
  }
}

const TemporalShim = {
  PlainDate,
  PlainYearMonth,
  Now: {
    plainDateISO(): PlainDate {
      const date = new Date()
      return new PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).Temporal = TemporalShim
