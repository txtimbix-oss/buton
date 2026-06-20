<template>
  <div v-if="totalPages > 1" class="pager">
    <button class="btn btn--ghost btn--sm" :disabled="page === 1" @click="$emit('prev')">← Назад</button>
    <button
      v-for="(pageNumber, index) in pageNumbers"
      :key="`${index}-${pageNumber}`"
      class="btn btn--sm"
      :class="pageNumber === page ? 'btn--primary' : 'btn--ghost'"
      @click="$emit('select', pageNumber)"
    >{{ pageNumber }}</button>
    <button class="btn btn--ghost btn--sm" :disabled="page === totalPages" @click="$emit('next')">Далее →</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  page: number
  pageNumbers: number[]
  totalPages: number
}>()

defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'select', value: number): void
}>()
</script>
