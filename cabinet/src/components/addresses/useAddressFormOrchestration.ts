import { watch } from 'vue'

export type AddressFormModel = {
  label: string
  address: string
  isDefault: boolean
}

type AddressFormOrchestrationProps = Readonly<{
  open: boolean
  modelValue: AddressFormModel
}>

type AddressFormOrchestrationEmit = {
  (event: 'close'): void
  (event: 'update:modelValue', value: AddressFormModel): void
}

type AddressSuggestController = {
  suggest: (value: string) => void
  clear: () => void
}

export function useAddressFormOrchestration(
  props: AddressFormOrchestrationProps,
  emit: AddressFormOrchestrationEmit,
  addrSuggest: AddressSuggestController,
) {
  watch(
    () => props.open,
    (open) => {
      if (!open) addrSuggest.clear()
    },
  )

  function updateModel(patch: Partial<AddressFormModel>) {
    emit('update:modelValue', { ...props.modelValue, ...patch })
  }

  function handleLabelInput(event: Event) {
    updateModel({ label: (event.target as HTMLInputElement).value })
  }

  function handleAddressInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    updateModel({ address: value })
    addrSuggest.suggest(value)
  }

  function clearSuggestions() {
    addrSuggest.clear()
  }

  function handleDefaultChange(event: Event) {
    updateModel({ isDefault: (event.target as HTMLInputElement).checked })
  }

  function toggleDefault() {
    updateModel({ isDefault: !props.modelValue.isDefault })
  }

  function selectSuggestion(value: string) {
    updateModel({ address: value })
    clearSuggestions()
  }

  function handleClose() {
    clearSuggestions()
    emit('close')
  }

  return {
    clearSuggestions,
    handleAddressInput,
    handleClose,
    handleDefaultChange,
    handleLabelInput,
    selectSuggestion,
    toggleDefault,
  }
}
