<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarGrid } from '@/engine/types'

const props = defineProps<{
  grid: CalendarGrid
  locale: string
}>()

defineEmits<{
  select: [date: Temporal.PlainDate]
}>()

const rows = computed(() => {
  const result = []
  for (let i = 0; i < 6; i++) {
    result.push(props.grid.cells.slice(i * 7, i * 7 + 7))
  }
  return result
})
</script>

<template>
  <table class="dp-grid" role="grid">
    <thead>
      <tr>
        <th v-for="day in grid.weekdays" :key="day" :abbr="day" scope="col" class="dp-weekday">
          {{ day }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" :key="index">
        <td
          v-for="cell in row"
          :key="cell.date.toString()"
          role="gridcell"
          class="dp-cell"
          :class="{
            'dp-cell--other-month': !cell.isCurrentMonth,
            'dp-cell--today': cell.isToday,
            'dp-cell--selected': cell.isSelected,
            'dp-cell--disabled': cell.isDisabled,
          }"
          :aria-selected="cell.isSelected || undefined"
          :aria-disabled="cell.isDisabled || undefined"
          :aria-label="cell.date.toLocaleString(locale, { dateStyle: 'full' })"
          :tabindex="cell.isCurrentMonth && !cell.isDisabled ? 0 : -1"
          @click="!cell.isDisabled && $emit('select', cell.date)"
          @keydown.enter.prevent="!cell.isDisabled && $emit('select', cell.date)"
        >
          <span class="dp-cell-inner" aria-hidden="true">{{ cell.date.day }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
