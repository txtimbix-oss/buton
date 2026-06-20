<template>
  <button
    v-for="filter in filters"
    :key="filter.value"
    class="fchip"
    :class="{ 'is-on': activeFilter === filter.value }"
    @click="emit('select', filter.value)"
  >
    {{ filter.label }}
  </button>
</template>

<script setup lang="ts">
import type { ReviewFilterOption, ReviewFilterValue } from './reviewOptions'

defineProps<{
  filters: ReviewFilterOption[]
  activeFilter: ReviewFilterValue
}>()

const emit = defineEmits<{
  (e: 'select', value: ReviewFilterValue): void
}>()
</script>
