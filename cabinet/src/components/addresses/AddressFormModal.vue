<template>
  <CabModal :open="open" :title="title" @close="handleClose">
    <div v-if="error" class="alert-err alert-err--mb">{{ error }}</div>

    <label class="field">
      <span>Название (Дом / Работа / другое)</span>
      <input
        :value="modelValue.label"
        class="input"
        type="text"
        placeholder="Дом"
        @input="handleLabelInput"
      />
    </label>

    <div class="field">
      <span>Адрес *</span>
      <div class="addr-suggest">
        <input
          :value="modelValue.address"
          class="input"
          type="text"
          placeholder="Санкт-Петербург, ул. Ленина, д. 1, кв. 10"
          autocomplete="off"
          required
          @input="handleAddressInput"
          @blur="clearSuggestions"
        />
        <ul v-if="addrSuggest.suggestions.value.length" class="addr-suggest__list">
          <li
            v-for="suggestion in addrSuggest.suggestions.value"
            :key="suggestion"
            class="addr-suggest__item"
            @mousedown.prevent="selectSuggestion(suggestion)"
          >{{ suggestion }}</li>
        </ul>
      </div>
    </div>

    <label class="field addr-default" :class="{ 'is-on': modelValue.isDefault }" @click="toggleDefault">
      <input
        :checked="modelValue.isDefault"
        type="checkbox"
        class="addr-default__input"
        @click.stop
        @change="handleDefaultChange"
      />
      Сделать адресом по умолчанию
    </label>

    <template #footer>
      <div class="modal-actions-row">
        <button class="btn btn--ghost btn--stretch" @click="handleClose">Отмена</button>
        <button class="btn btn--primary btn--stretch" @click="emit('submit')" :disabled="saving || !modelValue.address">
          <span v-if="saving" class="spinner spinner--sm"></span>
          <span v-else>{{ submitLabel }}</span>
        </button>
      </div>
    </template>
  </CabModal>
</template>

<script setup lang="ts">
import CabModal from '@/components/CabModal.vue'
import { useDadata } from '@/composables/useDadata'
import {
  useAddressFormOrchestration,
  type AddressFormModel,
} from './useAddressFormOrchestration'

const props = defineProps<{
  open: boolean
  title: string
  submitLabel: string
  modelValue: AddressFormModel
  saving: boolean
  error: string
}>()

const emit = defineEmits<{
  close: []
  submit: []
  'update:modelValue': [value: AddressFormModel]
}>()

const addrSuggest = useDadata()
const {
  clearSuggestions,
  handleAddressInput,
  handleClose,
  handleDefaultChange,
  handleLabelInput,
  selectSuggestion,
  toggleDefault,
} = useAddressFormOrchestration(props, emit, addrSuggest)
</script>

<style scoped>
.field.is-on { border-color: var(--green) !important; }
</style>
