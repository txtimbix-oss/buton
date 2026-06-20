<template>
  {{ text }}
  <RouterLink :to="to">{{ linkText }}</RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  to: string
  linkText: string
}>()
</script>
