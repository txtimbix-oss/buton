<template>
  <component
    :is="tagName"
    class="cab-avatar"
    :class="componentClasses"
    :type="buttonType"
    :aria-label="ariaLabel"
    @click="onClick"
  >
    <img v-if="src" class="cab-avatar__img" :src="src" :alt="alt" />
    <span v-else class="cab-avatar__fallback">{{ initials }}</span>

    <div v-if="hasOverlay" class="cab-avatar__overlay">
      <slot name="overlay" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  src?: string | null
  initials: string
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  serif?: boolean
}>(), {
  src: null,
  alt: 'Аватар',
  size: 'sm',
  clickable: false,
  serif: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const slots = useSlots()

const tagName = computed(() => (props.clickable ? 'button' : 'div'))
const componentClasses = computed(() => ([
  `cab-avatar--${props.size}`,
  { 'cab-avatar--serif': props.serif, 'is-clickable': props.clickable },
]))
const buttonType = computed(() => (props.clickable ? 'button' : undefined))
const ariaLabel = computed(() => (props.clickable ? props.alt : undefined))
const hasOverlay = computed(() => Boolean(slots.overlay))

function onClick(event: MouseEvent) {
  if (!props.clickable) return
  emit('click', event)
}
</script>

<style scoped>
.cab-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  overflow: hidden;
  border: none;
  padding: 0;
  border-radius: 50%;
  background: var(--green);
  color: var(--blush);
  font-weight: 700;
  line-height: 1;
}

.cab-avatar--sm {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.cab-avatar--md {
  width: 56px;
  height: 56px;
  font-size: 24px;
}

.cab-avatar--lg {
  width: 72px;
  height: 72px;
  font-size: 28px;
}

.cab-avatar--serif {
  font-family: var(--serif);
}

.cab-avatar.is-clickable {
  cursor: pointer;
}

.cab-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cab-avatar__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cab-avatar__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}

.cab-avatar.is-clickable:hover .cab-avatar__overlay {
  opacity: 1;
}

.cab-avatar__overlay svg {
  color: #fff;
}
</style>
