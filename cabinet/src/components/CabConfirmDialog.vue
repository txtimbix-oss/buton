<template>
  <CabModal :open="open" :closable="false" size="sm" @close="$emit('cancel')">
    <div class="cab-confirm">
      <div v-if="icon" class="cab-confirm__icon">{{ icon }}</div>
      <div class="cab-confirm__title">{{ title }}</div>
      <div class="cab-confirm__text">{{ text }}</div>
    </div>

    <template #footer>
      <div class="cab-confirm__actions">
        <button class="btn btn--ghost btn--sm" type="button" @click="$emit('cancel')">{{ cancelLabel }}</button>
        <button class="btn btn--sm" :class="confirmClass" type="button" :disabled="loading" @click="$emit('confirm')">
          <span v-if="loading" class="spinner spinner--sm" :class="loadingClass"></span>
          <span v-else>{{ confirmLabel }}</span>
        </button>
      </div>
    </template>
  </CabModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CabModal from '@/components/CabModal.vue'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  text: string
  confirmLabel?: string
  cancelLabel?: string
  icon?: string
  loading?: boolean
  variant?: 'danger' | 'primary'
}>(), {
  confirmLabel: 'Подтвердить',
  cancelLabel: 'Отмена',
  icon: '',
  loading: false,
  variant: 'danger',
})

defineEmits<{
  cancel: []
  confirm: []
}>()

const confirmClass = computed(() =>
  props.variant === 'primary' ? 'btn--primary' : 'btn--danger'
)

const loadingClass = computed(() =>
  props.variant === 'primary' ? 'spinner--light' : 'spinner--ink'
)
</script>

<style scoped>
.cab-confirm {
  text-align: center;
}

.cab-confirm__icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.cab-confirm__title {
  font-family: var(--serif);
  font-size: 22px;
  margin-bottom: 8px;
  color: var(--ink);
}

.cab-confirm__text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
}

.cab-confirm__actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
