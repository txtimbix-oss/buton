<template>
  <div class="chat-rating">
    <template v-if="!rated">
      <p class="chat-box__hint">Оцените нашу поддержку:</p>
      <div class="chat-rating__stars">
        <button
          v-for="n in 5"
          :key="n"
          class="chat-star"
          :class="{ 'is-on': n <= hoverRating }"
          @mouseenter="hoverRating = n"
          @mouseleave="hoverRating = 0"
          @click="emit('rate', n)"
        >★</button>
      </div>
    </template>
    <p v-else class="chat-box__hint chat-box__hint--closed">Спасибо за оценку!</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rated: boolean
}>()

const emit = defineEmits<{
  rate: [value: number]
}>()

const hoverRating = ref(0)
</script>
