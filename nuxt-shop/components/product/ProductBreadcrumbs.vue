<template>
  <div class="container">
    <nav class="breadcrumb">
      <NuxtLink to="/">Главная</NuxtLink><span class="sep">·</span>
      <NuxtLink to="/catalog">Каталог</NuxtLink><span class="sep">·</span>
      <span>{{ productName }}</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  productName: string
}>()
</script>
