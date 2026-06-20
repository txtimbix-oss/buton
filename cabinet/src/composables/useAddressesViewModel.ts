import { computed, ref } from 'vue'
import { getErrorMessage } from '@/composables/getErrorMessage'
import type { AddressFormModel } from '@/components/addresses/useAddressFormOrchestration'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { IAddress } from '@/types/user-address'

const EMPTY_FORM: AddressFormModel = {
  label: '',
  address: '',
  isDefault: false,
}

function toFormModel(address?: IAddress): AddressFormModel {
  return {
    label: address?.label ?? '',
    address: address?.address ?? '',
    isDefault: address?.isDefault ?? false,
  }
}

export function useAddressesViewModel() {
  const auth = useAuthStore()
  const toast = useToastStore()

  const user = computed(() => auth.user)
  const addresses = computed(() => auth.addresses)
  const modal = ref(false)
  const editId = ref<string | null>(null)
  const deleteId = ref<string | null>(null)
  const modalError = ref('')
  const saving = ref(false)
  const form = ref<AddressFormModel>({ ...EMPTY_FORM })

  function openModal(address?: IAddress) {
    editId.value = address?._id ?? null
    form.value = toFormModel(address)
    modalError.value = ''
    modal.value = true
  }

  function closeModal() {
    modal.value = false
  }

  function requestDelete(id: string) {
    deleteId.value = id
  }

  function cancelDelete() {
    deleteId.value = null
  }

  async function save() {
    if (!form.value.address) return

    saving.value = true
    modalError.value = ''
    try {
      if (editId.value) await auth.updateAddress(editId.value, form.value)
      else await auth.addAddress(form.value)
      toast.show(editId.value ? 'Адрес обновлён' : 'Адрес добавлен', 'success')
      closeModal()
    } catch (error: unknown) {
      modalError.value = getErrorMessage(error, 'Не удалось сохранить адрес. Проверьте данные и попробуйте ещё раз.')
    } finally {
      saving.value = false
    }
  }

  async function confirmRemove() {
    const id = deleteId.value
    if (!id) return

    deleteId.value = null
    try {
      await auth.deleteAddress(id)
      toast.show('Адрес удалён', 'success')
    } catch (error: unknown) {
      toast.show(getErrorMessage(error, 'Не удалось удалить адрес. Обновите страницу и попробуйте ещё раз.'), 'error')
    }
  }

  async function setDefault(id: string) {
    try {
      await auth.updateAddress(id, { isDefault: true })
      toast.show('Основной адрес обновлён', 'success')
    } catch (error: unknown) {
      toast.show(getErrorMessage(error, 'Не удалось обновить основной адрес. Попробуйте ещё раз.'), 'error')
    }
  }

  return {
    addresses,
    cancelDelete,
    closeModal,
    confirmRemove,
    deleteId,
    editId,
    form,
    modal,
    modalError,
    openModal,
    requestDelete,
    save,
    saving,
    setDefault,
    user,
  }
}
