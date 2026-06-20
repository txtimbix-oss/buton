<template>
  <CabModal :open="open" :title="`Отзыв на «${item?.name ?? ''}»`" @close="$emit('close')">
    <div v-if="error" class="alert alert--error">{{ error }}</div>
    <div class="form-group">
      <label>Оценка *</label>
      <div class="stars review-stars">
        <span
          v-for="star in 5"
          :key="star"
          class="star star-lg interactive"
          :class="{ filled: star <= modelValue.rating }"
          @click="setRating(star)"
        >★</span>
      </div>
    </div>
    <div class="form-group">
      <label>Отзыв *</label>
      <textarea
        :value="modelValue.text"
        class="textarea"
        rows="4"
        placeholder="Поделитесь впечатлениями…"
        @input="setTextFromEvent"
      ></textarea>
    </div>

    <template #footer>
      <div class="modal-actions">
        <button class="btn btn--ghost" @click="$emit('close')">Отмена</button>
        <button
          class="btn btn--primary"
          :disabled="saving || !modelValue.rating || !modelValue.text.trim()"
          @click="$emit('submit')"
        >
          <span v-if="saving" class="spinner spinner--sm spinner--ink"></span>
          <span v-else>Отправить</span>
        </button>
      </div>
    </template>
  </CabModal>
</template>

<script setup lang="ts">
import CabModal from '@/components/CabModal.vue'
import type { CabinetOrderItem } from '@/types/order'

interface ReviewForm {
  rating: number
  text: string
}

const props = defineProps<{
  open: boolean
  item: CabinetOrderItem | null
  modelValue: ReviewForm
  error: string
  saving: boolean
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'submit'): void
  (event: 'update:modelValue', value: ReviewForm): void
}>()

function setRating(rating: number) {
  emit('update:modelValue', { ...props.modelValue, rating })
}

function setText(text: string) {
  emit('update:modelValue', { ...props.modelValue, text })
}

function setTextFromEvent(event: Event) {
  const target = event.target
  if (!(target instanceof HTMLTextAreaElement)) return
  setText(target.value)
}
</script>
