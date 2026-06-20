<template>
  <div class="auth-wrap">
    <div class="auth-col">
      <RouterLink to="/" class="auth-logo">spb<b>shop</b></RouterLink>

      <slot />

      <div v-if="$slots.below" class="auth-below">
        <slot name="below" />
      </div>
    </div>

    <div class="auth-side">
      <div class="auth-bloom" :class="bloomClass"></div>
      <div class="auth-side__quote">
        <p>{{ quote }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quote: string
  bloomClass: string
}>()
</script>

<style scoped>
.auth-bloom {
  position: absolute;
  inset: 0;
}
</style>
