<template>
  <div class="field dp-field" :ref="fieldRef">
    <label>Дата доставки <span class="req">*</span></label>
    <button
      type="button"
      class="input dp-btn"
      :class="{ 'input--err': formErrors.date }"
      @click="emit('toggle')"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="cart-datepicker-icon"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span :class="{ 'cart-datepicker-value--empty': !form.date }">
        {{ form.date ? fmtDateRu(form.date) : 'Выберите дату' }}
      </span>
    </button>
    <span v-if="formErrors.date" class="field-err">{{ formErrors.date }}</span>

    <!-- Попап-календарь -->
    <Transition name="dp-pop">
      <div v-if="dpOpen" class="dp-popup">
        <div class="dp-header">
          <button type="button" class="dp-nav" @click="emit('prevMonth')">‹</button>
          <span class="dp-month-label">{{ dpMonthLabel }}</span>
          <button type="button" class="dp-nav" @click="emit('nextMonth')">›</button>
        </div>
        <div class="dp-weekdays">
          <span v-for="d in ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']" :key="d">{{ d }}</span>
        </div>
        <div class="dp-days">
          <span v-for="cell in dpCells" :key="cell.key"
            class="dp-day"
            :class="{
              'dp-day--empty':    !cell.date,
              'dp-day--past':     cell.date && cell.date < todayStr,
              'dp-day--selected': cell.date === form.date,
              'dp-day--today':    cell.date === todayStr,
            }"
            @click="cell.date && cell.date >= todayStr && emit('selectDate', cell.date)"
          >{{ cell.label }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface DateCell {
  key: string
  date: string | null
  label: string
}

defineProps<{
  form: { date: string }
  formErrors: { date: string }
  dpOpen: boolean
  todayStr: string
  dpMonthLabel: string
  dpCells: DateCell[]
  fmtDateRu: (date: string) => string
  fieldRef: (el: Element | null) => void
}>()

const emit = defineEmits<{
  toggle: []
  prevMonth: []
  nextMonth: []
  selectDate: [date: string]
}>()
</script>
