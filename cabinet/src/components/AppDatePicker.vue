<template>
  <div class="adp" ref="rootRef">
    <button
      type="button"
      class="input adp__btn"
      @click="toggleOpen"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="adp__icon" stroke-width="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span :class="modelValue ? '' : 'adp__placeholder'">
        {{ displayValue }}
      </span>
    </button>

    <Transition name="adp-pop">
      <div v-if="open" class="adp__popup">
        <div class="adp__header">
          <button type="button" class="adp__nav" @click="prevMonth">‹</button>
          <span class="adp__label">{{ monthLabel }}</span>
          <button type="button" class="adp__nav" @click="nextMonth">›</button>
        </div>
        <div class="adp__weekdays">
          <span v-for="day in WEEKDAYS" :key="day">{{ day }}</span>
        </div>
        <div class="adp__days">
          <span
            v-for="cell in cells"
            :key="cell.key"
            class="adp__day"
            :class="{
              'adp__day--empty':    !cell.date,
              'adp__day--disabled': cell.date && isDisabled(cell.date),
              'adp__day--selected': cell.date === modelValue,
              'adp__day--today':    cell.date === today,
            }"
            @click="cell.date && !isDisabled(cell.date) && pick(cell.date)"
          >{{ cell.label }}</span>
        </div>
        <div v-if="modelValue" class="adp__clear" @click="clearSelection">✕ Очистить</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  APP_DATE_PICKER_WEEKDAYS as WEEKDAYS,
  formatDatePickerValueRu,
  isDatePickerDateDisabled,
  useAppDatePickerCalendar,
} from '../composables/useAppDatePickerCalendar'
import { useDatePickerPopover } from '../composables/useDatePickerPopover'

const DEFAULT_PLACEHOLDER = 'Выберите дату'
const EMPTY_VALUE = ''

const props = defineProps<{
  modelValue: string
  placeholder?: string
  blockPast?: boolean
  blockFuture?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const { open, rootRef, toggleOpen } = useDatePickerPopover()
const {
  today,
  monthLabel,
  cells,
  prevMonth,
  nextMonth,
  syncToDate,
} = useAppDatePickerCalendar()

const displayValue = computed(() => (
  props.modelValue
    ? formatDatePickerValueRu(props.modelValue)
    : (props.placeholder ?? DEFAULT_PLACEHOLDER)
))

function isDisabled(date: string) {
  return isDatePickerDateDisabled(date, {
    today,
    blockPast: props.blockPast,
    blockFuture: props.blockFuture,
  })
}

function pick(date: string) {
  emit('update:modelValue', date)
  open.value = false

  if (!date) return

  syncToDate(date)
}

function clearSelection() {
  pick(EMPTY_VALUE)
}
</script>

<style scoped>
.adp { position: relative; }

.adp__btn {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-weight: 500;
}
.adp__icon {
  opacity: .5;
  flex-shrink: 0;
}
.adp__placeholder {
  opacity: .45;
  font-weight: 400;
}

.adp__popup {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 200;
  background: #fff;
  border: 1.5px solid #e5e0d8;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(0,0,0,.12);
  padding: 12px;
  width: 260px;
  user-select: none;
}

.adp__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.adp__label { font-weight: 600; font-size: 13.5px; }
.adp__nav {
  width: 28px; height: 28px;
  border: none; background: transparent;
  border-radius: 4px; cursor: pointer;
  font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  transition: background .12s;
}
.adp__nav:hover { background: #f5f0e8; }

.adp__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.adp__weekdays span {
  text-align: center;
  font-size: 10.5px;
  font-weight: 700;
  color: #999;
  padding: 2px 0;
}

.adp__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.adp__day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  border-radius: 4px;
  cursor: pointer;
  transition: background .1s;
}
.adp__day:hover:not(.adp__day--disabled):not(.adp__day--empty) { background: #f5f0e8; }
.adp__day--empty    { cursor: default; }
.adp__day--disabled { color: #bbb; cursor: default; opacity: .5; }
.adp__day--today    { font-weight: 700; color: #2e4736; }
.adp__day--selected { background: #2e4736; color: #fff; border-radius: 4px; }

.adp__clear {
  margin-top: 8px;
  text-align: center;
  font-size: 11.5px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background .12s, color .12s;
}
.adp__clear:hover { background: #f5f0e8; color: #b6543a; }

.adp-pop-enter-active, .adp-pop-leave-active { transition: opacity .15s, transform .15s; }
.adp-pop-enter-from, .adp-pop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
