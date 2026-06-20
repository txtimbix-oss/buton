<template>
  <div>
    <div v-for="card in count" :key="card" class="sk sk-card"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  count?: number
}>(), {
  count: 2,
})
</script>
