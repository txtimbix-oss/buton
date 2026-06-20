<template>
  <p class="page-sub page-sub--gutted">
    {{ count }} {{ plural(count, 'товар', 'товара', 'товаров') }}
  </p>
</template>

<script setup lang="ts">
defineProps<{
  count: number
}>()

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100

  if (mod10 === 1 && mod100 !== 11) return one
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return few

  return many
}
</script>
