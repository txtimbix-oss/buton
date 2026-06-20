<template>
  <div class="ymap-picker">
    <button type="button" class="ymap-toggle" @click="toggle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" width="15" height="15" class="ymap-toggle__icon">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      {{ isOpen ? 'Скрыть карту' : 'Выбрать на карте' }}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"
        class="ymap-toggle__caret"
        :class="{ 'is-open': isOpen }"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <Transition name="map-expand">
      <div v-if="isOpen" class="ymap-picker__body">
        <div class="ymap-picker__map-wrap">
          <div ref="mapEl" class="ymap-picker__map" />
          <div v-if="mapLoading" class="ymap-picker__overlay">Загружаем карту…</div>
        </div>
        <div class="ymap-picker__foot">
          <template v-if="geocoding">
            <span class="ymap-picker__hint">Определяем адрес…</span>
          </template>
            <template v-else-if="pickedAddress">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" width="13" height="13"
              class="ymap-picker__icon"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="ymap-picker__addr">{{ pickedAddress }}</span>
          </template>
          <template v-else>
            <span class="ymap-picker__hint">Нажмите на карте, чтобы выбрать адрес доставки</span>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ select: [address: string] }>()

const {
  isOpen,
  mapEl,
  mapLoading,
  geocoding,
  pickedAddress,
  toggle,
  destroy,
} = useYandexMapPicker({
  onSelect: (address) => emit('select', address),
})

onUnmounted(() => {
  destroy()
})
</script>

<style scoped>
.ymap-picker {
  margin-top: 6px;
}

.ymap-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  background: var(--paper-2);
  border: 1.5px solid var(--line);
  border-radius: 6px;
  padding: 9px 14px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: background .15s, border-color .15s;
}
.ymap-toggle:hover {
  background: var(--paper-3);
  border-color: var(--green);
}

.ymap-picker__body {
  margin-top: 8px;
  border: 1.5px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}

.ymap-picker__map-wrap {
  position: relative;
}

.ymap-picker__map {
  width: 100%;
  height: 300px;
}
.ymap-toggle__icon { flex-shrink: 0; }
.ymap-toggle__caret {
  margin-left: auto;
  transition: transform .2s;
}
.ymap-toggle__caret.is-open { transform: rotate(180deg); }
.ymap-picker__icon { flex-shrink: 0; color: var(--green); }

@media (min-width: 768px) {
  .ymap-picker__map { height: 380px; }
}

.ymap-picker__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(244, 238, 226, .85);
  font-size: 14px;
  color: var(--muted);
}

.ymap-picker__foot {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  background: var(--white);
  border-top: 1px solid var(--line);
  min-height: 44px;
}

.ymap-picker__hint {
  font-size: 13px;
  color: var(--muted);
}

.ymap-picker__addr {
  font-size: 13px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-expand-enter-active,
.map-expand-leave-active {
  transition: opacity .2s, transform .2s;
}
.map-expand-enter-from,
.map-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
