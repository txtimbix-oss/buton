<template>
  <section class="hero hero--floral">
    <div class="container hero__grid">
      <div class="hero__copy">
        <div class="eyebrow">{{ eyebrow }}</div>
        <h1 class="hero__h1">
          {{ title }}<br>
          <em>{{ titleEm }}</em>
        </h1>
        <p class="hero__sub">{{ subtitle }}</p>
        <div class="hero__cta">
          <NuxtLink
            v-for="action in actions"
            :key="`${action.to}-${action.label}`"
            :to="action.to"
            :class="heroActionClasses(action.tone)"
          >
            {{ action.label }}<template v-if="action.showArrow"> →</template>
          </NuxtLink>
        </div>
        <div class="hero__stats">
          <div v-for="stat in stats" :key="stat.label" class="hero__stat">
            <b>{{ stat.value }}</b><span>{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <div class="hero__media">
        <BloomImg :kind="product?.bloom || 'rose'" :label="product?.name" />
        <ShopImg
          v-if="product?.images?.[0]"
          :src="product.images[0]"
          :alt="product.name"
          class="hero__real-img"
          sizes="(max-width: 768px) 100vw, 50vw"
          :eager="true"
        />
        <div class="hero__badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>
          <span>{{ deliveryBadgePrefix }} · <b>{{ deliveryBadgeValue }}</b></span>
        </div>
        <div v-if="product" class="hero__card">
          <div>
            <div class="hero__card-name">{{ product.name }}</div>
            <div class="hero__card-price">от {{ product.price.toLocaleString('ru-RU') }} ₽</div>
          </div>
          <button class="hero__card-add" aria-label="В корзину" @click="emit('quick-add', product)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useShop'

interface HeroStat {
  value: string
  label: string
}

type HeroActionTone = 'ink' | 'ghost' | 'clay'

interface HeroAction {
  label: string
  to: string
  tone: HeroActionTone
  showArrow?: boolean
}

defineProps<{
  eyebrow: string
  title: string
  titleEm: string
  subtitle: string
  actions: HeroAction[]
  deliveryBadgePrefix: string
  deliveryBadgeValue: string
  stats: HeroStat[]
  product: Product | null | undefined
}>()

const emit = defineEmits<{
  (e: 'quick-add', product: Product): void
}>()

const heroActionToneClass: Record<HeroActionTone, string> = {
  ink: 'btn--ink',
  ghost: 'btn--ghost',
  clay: 'btn--clay',
}

function heroActionClasses(tone: HeroActionTone) {
  return ['btn', heroActionToneClass[tone], 'btn--lg']
}
</script>
