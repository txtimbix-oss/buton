<template>
  <section v-if="html" class="sec sec--notop container">
    <div class="product-seo-text" v-html="html" />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  html: string
}>()
</script>
