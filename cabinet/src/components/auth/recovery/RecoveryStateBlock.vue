<template>
  <div :class="rootClass">
    <div v-if="slots.icon" :class="iconClass">
      <slot name="icon" />
    </div>
    <h1 :class="titleClass">{{ title }}</h1>
    <p class="lead">
      <slot>{{ lead }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  lead?: string
  success?: boolean
  centered?: boolean
}>(), {
  lead: '',
  success: false,
  centered: true,
})

const slots = useSlots()

const rootClass = computed(() => [
  { 'auth-centered': props.centered, 'auth-centered--success': props.centered && props.success },
])

const iconClass = computed(() => [
  'center-ico',
  { 'center-ico--success': props.success },
])

const titleClass = computed(() => props.centered ? 'auth-title-lg' : '')
</script>

<style scoped>
.center-ico { width: 56px; height: 56px; border-radius: 50%; background: color-mix(in srgb, var(--green) 12%, var(--paper)); color: var(--green); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.auth-centered { text-align: center; }
.auth-centered--success { padding: 8px 0; }
.center-ico svg { width: 28px; height: 28px; }
.auth-title-lg { font-size: 24px; }
.center-ico--success { background: rgba(46,71,54,.1); color: var(--green); }
</style>
