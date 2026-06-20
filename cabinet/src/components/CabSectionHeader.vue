<template>
  <div class="sec-head">
    <h2 class="sec-title">{{ title }}</h2>
    <slot name="action">
      <RouterLink v-if="to && actionLabel" :to="to">{{ actionLabel }}</RouterLink>
      <a v-else-if="href && actionLabel" :href="href">{{ actionLabel }}</a>
    </slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  actionLabel?: string
  to?: string
  href?: string
}>()
</script>
