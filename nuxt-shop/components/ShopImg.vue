<template>
  <picture class="shop-picture">
    <source
      v-if="srcset"
      type="image/webp"
      :srcset="srcset"
      :sizes="sizes"
    />
    <img
      v-bind="$attrs"
      :src="resolved"
      :alt="alt ?? ''"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
    />
  </picture>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  src: string
  alt?: string
  sizes?: string
  eager?: boolean
}>()

// /uploads/... проксируется через Nuxt (routeRules) и в dev и на проде.
// Абсолютные http-ссылки оставляем как есть.
function resolve(path: string): string {
  if (!path || path.startsWith('http') || path.startsWith('//') || path.startsWith('blob:')) return path
  return path
}

const resolved = computed(() => resolve(props.src))

const srcset = computed(() => {
  const s = props.src
  if (!s) return ''
  const m = s.match(/^(.*?)\.(jpg|jpeg|png|webp)(\?.*)?$/i)
  if (!m) return ''
  const base = m[1]
  if (/_(?:sm|md|lg|xl)$/.test(base)) return ''
  const q = m[3] ?? ''
  const b = resolve(base)
  return `${b}_sm.webp${q} 400w, ${b}_md.webp${q} 800w, ${b}_lg.webp${q} 1200w, ${b}_xl.webp${q} 1920w`
})
</script>

<style scoped>
.shop-picture {
  display: contents;
}
</style>
