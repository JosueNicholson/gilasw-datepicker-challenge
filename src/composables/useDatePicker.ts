import { ref, onMounted, onUnmounted } from 'vue'
import { DatePickerEngine } from '@/engine/DatePickerEngine'
import type { DatePickerOptions, DatePickerState } from '@/engine/types'

export function useDatePicker(options?: DatePickerOptions) {
  const engine = new DatePickerEngine(options)
  const state = ref<DatePickerState>(engine.getState())

  const sync = () => {
    state.value = engine.getState()
  }

  const goToPrevMonth = () => {
    engine.goToPrevMonth()
    sync()
  }
  const goToNextMonth = () => {
    engine.goToNextMonth()
    sync()
  }
  const goToPrevYear = () => {
    engine.goToPrevYear()
    sync()
  }
  const goToNextYear = () => {
    engine.goToNextYear()
    sync()
  }

  const selectDate = (date: Temporal.PlainDate) => {
    engine.selectDate(date)
    sync()
  }
  const clearSelection = () => {
    engine.clearSelection()
    sync()
  }

  const open = () => {
    engine.open()
    sync()
  }
  const close = () => {
    engine.close()
    sync()
  }
  const toggle = () => {
    engine.toggle()
    sync()
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && state.value.isOpen) {
      engine.close()
      sync()
    }
  }

  onMounted(() => document.addEventListener('keydown', handleKeydown))
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

  return {
    state,
    goToPrevMonth,
    goToNextMonth,
    goToPrevYear,
    goToNextYear,
    selectDate,
    clearSelection,
    open,
    close,
    toggle,
  }
}
