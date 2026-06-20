<template>
  <div class="cab-section">
    <h2 class="sec-title">Статус</h2>
    <div>
      <div
        v-for="(step, i) in timelineSteps"
        :key="step.key"
        class="tl-step"
        :class="stepClass(step.key)"
      >
        <div class="tl-dot">
          <svg
            v-if="stepClass(step.key) === 'done' || stepClass(step.key) === 'current'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h4>{{ step.label }}</h4>
          <time>
            {{
              i < (order.statusHistory?.length ?? 0)
                ? formatDateTime(order.statusHistory![i].changedAt)
                : (stepClass(step.key) === 'upcoming' ? 'ожидается' : '')
            }}
          </time>
        </div>
      </div>
    </div>
    <div class="order-status-actions">
      <button
        v-if="canCancel"
        class="btn btn--ghost"
        :disabled="cancelling"
        @click="$emit('cancel')"
      >
        <span v-if="cancelling" class="spinner spinner--sm spinner--ink"></span>
        <span v-else>Отменить заказ</span>
      </button>
      <button class="btn btn--ink" @click="$emit('repeat')">Повторить заказ</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { CabinetOrder } from '@/types/order'
import { formatDateTime } from '@/utils/formatters'

type TimelineStep = {
  key: string
  label: string
}

type StepState = 'done' | 'current' | 'upcoming' | 'cancelled'

defineProps({
  order: {
    type: Object as PropType<CabinetOrder>,
    required: true,
  },
  timelineSteps: {
    type: Array as PropType<TimelineStep[]>,
    required: true,
  },
  stepClass: {
    type: Function as PropType<(key: string) => StepState>,
    required: true,
  },
  canCancel: {
    type: Boolean,
    required: true,
  },
  cancelling: {
    type: Boolean,
    required: true,
  },
})

defineEmits<{
  (e: 'cancel'): void
  (e: 'repeat'): void
}>()
</script>
