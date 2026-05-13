<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  viewMonth: Temporal.PlainYearMonth
  locale: string
}>()

defineEmits<{
  'prev-month': []
  'next-month': []
  'prev-year': []
  'next-year': []
}>()

const label = computed(() =>
  props.viewMonth.toPlainDate({ day: 1 }).toLocaleString(props.locale, {
    month: 'long',
    year: 'numeric',
  }),
)
</script>

<template>
  <div class="dp-header">
    <button class="dp-nav-btn" aria-label="Previous year" @click="$emit('prev-year')">
      &#171;
    </button>
    <button class="dp-nav-btn" aria-label="Previous month" @click="$emit('prev-month')">
      &#8249;
    </button>
    <span class="dp-header-label">{{ label }}</span>
    <button class="dp-nav-btn" aria-label="Next month" @click="$emit('next-month')">&#8250;</button>
    <button class="dp-nav-btn" aria-label="Next year" @click="$emit('next-year')">&#187;</button>
  </div>
</template>
