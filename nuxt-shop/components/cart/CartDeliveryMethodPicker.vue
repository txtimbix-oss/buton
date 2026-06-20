<template>
  <div class="radio-row cart-radio-row">
    <div
      v-for="(d, i) in deliveries" :key="d.label"
      :class="`radio-card ${activeDelivery === i ? 'is-sel' : ''}`"
      @click="emit('update:activeDelivery', i)"
    >
      <span class="dot" />
      <span class="t">{{ d.label }}</span>
      <span class="s">
        {{ d.desc }}
        <template v-if="i !== 2">
          · {{ deliveryPreviewIsFree ? 'Бесплатно' : (zoneDeliveryCost.toLocaleString('ru-RU') + ' ₽') }}
        </template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DeliveryOption {
  label: string
  desc: string
  type: string
}

defineProps<{
  deliveries: DeliveryOption[]
  activeDelivery: number
  deliveryPreviewIsFree: boolean
  zoneDeliveryCost: number
}>()

const emit = defineEmits<{
  'update:activeDelivery': [index: number]
}>()
</script>
