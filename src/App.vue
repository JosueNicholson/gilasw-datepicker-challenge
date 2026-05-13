<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker/DatePicker.vue'

const selectedDate = ref('')
</script>

<template>
  <main class="demo">
    <h1 class="demo-title">Headless DatePicker</h1>
    <p class="demo-subtitle">Vue 3 + Vanilla TS engine + Temporal API</p>
    <DatePicker v-model="selectedDate" placeholder="Select a date" locale="en-US" />
    <p v-if="selectedDate" class="demo-result">
      Selected: <strong>{{ selectedDate }}</strong>
    </p>
  </main>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  background: var(--app-color-page-bg);
  display: flex;
  justify-content: center;
  padding: 4rem 1rem;
  min-height: 100vh;
}

.demo {
  max-width: 28rem;
  width: 100%;
}

.demo-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--app-color-text-strong);
  margin: 0 0 0.25rem;
}

.demo-subtitle {
  font-size: 0.875rem;
  color: var(--app-color-text-muted);
  margin: 0 0 1.5rem;
}

.demo-result {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--app-color-text-body);
}
</style>
