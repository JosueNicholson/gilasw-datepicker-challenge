<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDatePicker } from '@/composables/useDatePicker'
import CalendarHeader from './CalendarHeader.vue'
import CalendarGrid from './CalendarGrid.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | Date
    placeholder?: string
    locale?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Select a date',
    locale: 'en-US',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const rootEl = ref<HTMLElement | null>(null)

const {
  state,
  goToPrevMonth,
  goToNextMonth,
  goToPrevYear,
  goToNextYear,
  selectDate: engineSelectDate,
  close,
  toggle,
} = useDatePicker({
  locale: props.locale,
  initialDate: parseInitialDate(props.modelValue),
})

function parseInitialDate(value: string | Date): Temporal.PlainDate | undefined {
  if (!value) return
  try {
    if (typeof value === 'string') {
      return Temporal.PlainDate.from(value)
    } else {
      // convert Date to an acceptable string for .from function
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const instant = value.toTemporalInstant()
      const zonedDateTime = instant.toZonedDateTimeISO(userTimeZone)
      const rfc9557String = zonedDateTime.toString()

      return Temporal.PlainDate.from(rfc9557String)
    }
  } catch (error) {
    console.warn(`datepicker invalid initial value: ${value}`)
    console.error(error)
    return undefined
  }
}

function handleSelect(date: Temporal.PlainDate) {
  engineSelectDate(date)
  emit('update:modelValue', date.toString())
  close()
}

function handleClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="rootEl" class="dp-root">
    <input
      class="dp-input"
      type="text"
      readonly
      :value="state.inputValue"
      :placeholder="placeholder"
      aria-haspopup="dialog"
      :aria-expanded="state.isOpen"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space.prevent="toggle"
    />

    <div
      v-show="state.isOpen"
      class="dp-popover"
      role="dialog"
      aria-modal="true"
      aria-label="Date picker calendar"
    >
      <CalendarHeader
        :view-month="state.viewMonth"
        :locale="locale"
        @prev-month="goToPrevMonth"
        @next-month="goToNextMonth"
        @prev-year="goToPrevYear"
        @next-year="goToNextYear"
      />
      <CalendarGrid :grid="state.grid" @select="handleSelect" />
    </div>
  </div>
</template>

<style scoped>
.dp-root {
  position: relative;
  display: inline-block;
  font-size: var(--dp-font-size-base);
  color: var(--dp-color-text-primary);
}

.dp-input {
  width: 100%;
  padding: var(--dp-input-padding);
  border: 1px solid var(--dp-color-border);
  border-radius: var(--dp-radius-input);
  background: var(--dp-color-bg);
  color: var(--dp-color-text-primary);
  font-size: var(--dp-font-size-base);
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  transition: border-color var(--dp-transition-duration) var(--dp-transition-easing);
}

.dp-input:focus {
  border-color: var(--dp-color-accent);
}

.dp-popover {
  position: absolute;
  top: calc(100% + 0.375rem);
  left: 0;
  z-index: 100;
  background: var(--dp-color-bg);
  border: 1px solid var(--dp-color-border);
  border-radius: var(--dp-radius-popover);
  padding: var(--dp-popover-padding);
  box-shadow: var(--dp-shadow-popover);
  min-width: 18rem;
}

:deep(.dp-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

:deep(.dp-header-label) {
  font-weight: var(--dp-font-weight-header);
  font-size: var(--dp-font-size-base);
  color: var(--dp-color-text-primary);
}

:deep(.dp-nav-btn) {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--dp-radius-input);
  color: var(--dp-color-text-secondary);
  font-size: 1rem;
  line-height: 1;
  transition:
    background var(--dp-transition-duration) var(--dp-transition-easing),
    color var(--dp-transition-duration) var(--dp-transition-easing);
}

:deep(.dp-nav-btn:hover) {
  background: var(--dp-color-surface);
  color: var(--dp-color-text-primary);
}

:deep(.dp-grid) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.dp-weekday) {
  text-align: center;
  font-size: var(--dp-font-size-sm);
  font-weight: var(--dp-font-weight-header);
  color: var(--dp-color-text-secondary);
  padding-bottom: 0.5rem;
  width: var(--dp-cell-size);
}

:deep(.dp-cell) {
  padding: 0.125rem;
  cursor: pointer;
}

:deep(.dp-cell--disabled) {
  cursor: not-allowed;
}

:deep(.dp-cell-inner) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--dp-cell-size);
  height: var(--dp-cell-size);
  border-radius: var(--dp-radius-cell);
  font-size: var(--dp-font-size-base);
  color: var(--dp-color-text-primary);
  transition: background var(--dp-transition-duration) var(--dp-transition-easing);
}

:deep(.dp-cell:hover:not(.dp-cell--disabled):not(.dp-cell--selected) .dp-cell-inner) {
  background: var(--dp-color-surface);
}

:deep(.dp-cell--other-month .dp-cell-inner) {
  color: var(--dp-color-other-month);
}

:deep(.dp-cell--today .dp-cell-inner) {
  outline: 2px solid var(--dp-color-today-ring);
  outline-offset: -2px;
}

:deep(.dp-cell--selected .dp-cell-inner) {
  background: var(--dp-color-accent);
  color: var(--dp-color-accent-text);
}

:deep(.dp-cell--selected:hover .dp-cell-inner) {
  background: var(--dp-color-accent-hover);
}

:deep(.dp-cell--disabled .dp-cell-inner) {
  color: var(--dp-color-text-disabled);
}

:deep(.dp-cell:focus-visible .dp-cell-inner) {
  outline: 2px solid var(--dp-color-accent);
  outline-offset: -2px;
}
</style>
