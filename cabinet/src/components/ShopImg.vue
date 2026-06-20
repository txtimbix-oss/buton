<template>
  <picture class="shop-img">
    <source v-if="srcset" type="image/webp" :srcset="srcset" :sizes="sizes" />
    <img
      v-bind="$attrs"
      :src="src"
      :alt="alt ?? ''"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
    />
  </picture>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src: string
  alt?: string
  sizes?: string
  eager?: boolean
}>()

const srcset = computed(() => {
  const s = props.src
  if (!s) return ''
  const m = s.match(/^(.*?)\.(jpg|jpeg|png|webp)(\?.*)?$/i)
  if (!m) return ''
  const base = m[1]
  if (/_(?:sm|md|lg|xl)$/.test(base)) return ''
  const q = m[3] ?? ''
  return `${base}_sm.webp${q} 400w, ${base}_md.webp${q} 800w, ${base}_lg.webp${q} 1200w, ${base}_xl.webp${q} 1920w`
})
</script>

<style scoped>
.shop-img { display: contents; }
</style>
