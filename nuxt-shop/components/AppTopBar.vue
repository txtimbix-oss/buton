<template>
  <div class="topbar" aria-label="Объявление магазина">
    <p>{{ settings.announcementBar }}</p>
  </div>
</template>

<script setup lang="ts">
const settings = useSettings()
</script>
