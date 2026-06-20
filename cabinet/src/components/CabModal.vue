<template>
  <Teleport to="body">
    <Transition name="cab-modal-fade">
      <div v-if="open" class="cab-modal-backdrop" @click.self="close">
        <div class="cab-modal-shell" :class="shellSizeClass">
          <div v-if="hasHeader" class="cab-modal-shell__head">
            <h3 v-if="title" class="cab-modal-shell__title">{{ title }}</h3>
            <button v-if="closable" class="cab-modal-shell__close" type="button" aria-label="Закрыть" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>

          <div class="cab-modal-shell__body">
            <slot />
          </div>

          <div v-if="hasFooter" class="cab-modal-shell__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
}>(), {
  title: '',
  size: 'md',
  closable: true,
})

const emit = defineEmits<{
  close: []
}>()

const slots = useSlots()

const shellSizeClass = computed(() => `cab-modal-shell--${props.size}`)
const hasHeader = computed(() => Boolean(props.title) || props.closable)
const hasFooter = computed(() => Boolean(slots.footer))

function close() {
  emit('close')
}
</script>

<style scoped>
.cab-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(20,30,24,.45);
  backdrop-filter: blur(4px);
}

.cab-modal-shell {
  width: 100%;
  background: var(--white, #FBF8F1);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
}

.cab-modal-shell--sm { max-width: 360px; }
.cab-modal-shell--md { max-width: 520px; }
.cab-modal-shell--lg { max-width: 720px; }

.cab-modal-shell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 0;
}

.cab-modal-shell__title {
  margin: 0;
  font-family: var(--serif);
  font-size: 24px;
  line-height: 1.1;
}

.cab-modal-shell__close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cab-modal-shell__close svg {
  width: 18px;
  height: 18px;
}

.cab-modal-shell__body {
  padding: 24px;
}

.cab-modal-shell__footer {
  padding: 0 24px 24px;
}

.cab-modal-fade-enter-active,
.cab-modal-fade-leave-active {
  transition: opacity .2s;
}

.cab-modal-fade-enter-from,
.cab-modal-fade-leave-to {
  opacity: 0;
}

.cab-modal-fade-enter-active .cab-modal-shell,
.cab-modal-fade-leave-active .cab-modal-shell {
  transition: transform .2s;
}

.cab-modal-fade-enter-from .cab-modal-shell,
.cab-modal-fade-leave-to .cab-modal-shell {
  transform: scale(.96);
}
</style>
