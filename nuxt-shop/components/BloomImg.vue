<template>
  <div :class="`bloom bloom--${kind || 'rose'}`">
    <span class="bloom__rings" />
    <span v-if="cap || label" class="bloom__tag">{{ cap || label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kind?:  string
  cap?:   string
  label?: string
}>()
</script>
