<template>
  <div class="delivery-form">
    <div class="field">
      <label>
        Имя получателя <span class="req">*</span>
        <span v-if="shopUser" class="reg-badge">✓ Вы зарегистрированы</span>
      </label>
      <input
        v-model="form.name" class="input" type="text"
        placeholder="Имя получателя"
        :class="{ 'input--err': formErrors.name }"
      />
      <span v-if="formErrors.name" class="field-err">{{ formErrors.name }}</span>
    </div>
    <div class="field">
      <label>Телефон получателя <span class="req">*</span></label>
      <input
        v-model="form.phone" class="input" type="tel"
        placeholder="+7 (___) ___-__-__"
        :class="{ 'input--err': formErrors.phone }"
      />
      <span v-if="formErrors.phone" class="field-err">{{ formErrors.phone }}</span>
    </div>
    <div class="field cart-field--full">
      <label>Email (для подтверждения заказа)</label>
      <input v-model="form.email" class="input" type="email" placeholder="your@email.com" />
    </div>
    <div v-if="activeDelivery !== 2" class="field cart-field--full">
      <label>
        Адрес доставки <span class="req">*</span>
        <span v-if="hasProfileAddress" class="cart-field-hint">из профиля</span>
      </label>
      <div class="addr-suggest">
        <input
          v-model="form.address" class="input" type="text"
          :placeholder="`${settings.storeCity}, улица, дом, квартира`"
          :class="{ 'input--err': formErrors.address }"
          autocomplete="off"
          @input="suggest(form.address)"
          @blur="clear()"
        />
        <ul v-if="suggestions.length" class="addr-suggest__list">
          <li
            v-for="s in suggestions"
            :key="s"
            class="addr-suggest__item"
            @mousedown.prevent="form.address = s; clear()"
          >{{ s }}</li>
        </ul>
      </div>
      <span v-if="formErrors.address" class="field-err">{{ formErrors.address }}</span>
      <span v-else-if="detectedZone" class="cart-zone__info">
        ✓ Зона «{{ detectedZone.name }}» · {{ detectedZone.cost.toLocaleString('ru-RU') }} ₽
      </span>
      <span v-else-if="form.address && deliveryZones?.length" class="cart-zone__muted">
        Зона не определена · {{ defaultDeliveryCost }} ₽ (стандартная)
      </span>
      <ClientOnly>
        <YandexMapPicker @select="(addr) => { form.address = addr; clear() }" />
      </ClientOnly>
    </div>

    <CartDatePicker
      :form="form"
      :form-errors="formErrors"
      :dp-open="dpOpen"
      :today-str="todayStr"
      :dp-month-label="dpMonthLabel"
      :dp-cells="dpCells"
      :fmt-date-ru="fmtDateRu"
      :field-ref="setDpFieldRef"
      @toggle="emit('toggleDatePicker')"
      @prev-month="emit('prevMonth')"
      @next-month="emit('nextMonth')"
      @select-date="emit('selectDate', $event)"
    />

    <div class="field">
      <label>Время доставки</label>
      <select v-model="form.time" class="input">
        <option value="">Удобное время</option>
        <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
      </select>
    </div>
    <div class="field cart-field--full">
      <label>Текст открытки <span class="cart-field-hint">(необязательно)</span></label>
      <textarea v-model="form.card" class="input area" placeholder="Тёплые слова для получателя…" />
    </div>
    <div class="field anon-field cart-field--full">
      <label class="anon-row" @click="form.isAnonymous = !form.isAnonymous">
        <span class="anon-check" :class="{ on: form.isAnonymous }">
          <svg v-if="form.isAnonymous" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="2 6 5 9 10 3"/></svg>
        </span>
        <div>
          <span class="cart-anon-title">Анонимная доставка</span>
          <span class="cart-anon-subtitle">— получатель не узнает, от кого букет</span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DeliveryFormModel {
  name: string
  phone: string
  email: string
  address: string
  date: string
  time: string
  card: string
  isAnonymous: boolean
}

interface DeliveryFormErrors {
  name: string
  phone: string
  address: string
  date: string
}

interface DateCell {
  key: string
  date: string | null
  label: string
}

defineProps<{
  form: DeliveryFormModel
  formErrors: DeliveryFormErrors
  shopUser: unknown
  activeDelivery: number
  hasProfileAddress: boolean
  detectedZone: { name: string; cost: number } | null
  deliveryZones: unknown[] | null | undefined
  defaultDeliveryCost: number
  suggestions: string[]
  suggest: (query: string) => void
  clear: () => void
  timeSlots: string[]
  dpOpen: boolean
  todayStr: string
  dpMonthLabel: string
  dpCells: DateCell[]
  fmtDateRu: (date: string) => string
  setDpFieldRef: (el: Element | null) => void
}>()

const emit = defineEmits<{
  toggleDatePicker: []
  prevMonth: []
  nextMonth: []
  selectDate: [date: string]
}>()

const settings = useSettings()
</script>
