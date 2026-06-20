<template>
  <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
  <h1>{{ title }}</h1>
  <p class="lead">{{ lead }}</p>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  lead: string
  eyebrow?: string
}>()
</script>
