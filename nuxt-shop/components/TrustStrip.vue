<template>
  <div class="trust__row">
    <div v-for="(item, i) in items" :key="i" class="trust__item">
      <span class="trust__ico"><AppIcon :name="item.icon" /></span>
      <div>
        <b>{{ item.title }}</b>
        <span>{{ item.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const settings = useSettings()

const icons = ['truck', 'clock', 'leaf', 'gift']

const items = computed(() =>
  [1, 2, 3, 4].map((n, i) => ({
    icon:  icons[i],
    title: settings.value[`usp${n}Title`] || `Преимущество ${n}`,
    sub:   settings.value[`usp${n}Sub`]   || '',
  }))
)
</script>
