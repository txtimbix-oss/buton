import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAddressesViewModel } from '@/composables/useAddressesViewModel'
import type { IAddress } from '@/types/user-address'

const { auth, toast } = vi.hoisted(() => ({
  auth: {
    user: { _id: 'u1' },
    addresses: [] as IAddress[],
    addAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
  },
  toast: {
    show: vi.fn(),
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => auth,
}))

vi.mock('@/stores/toast', () => ({
  useToastStore: () => toast,
}))

function makeAddress(overrides: Partial<IAddress> = {}): IAddress {
  return {
    _id: 'a1',
    label: 'Дом',
    address: 'Невский 1',
    isDefault: true,
    ...overrides,
  }
}

describe('useAddressesViewModel', () => {
  beforeEach(() => {
    auth.user = { _id: 'u1' }
    auth.addresses = []
    auth.addAddress.mockReset().mockResolvedValue([])
    auth.updateAddress.mockReset().mockResolvedValue([])
    auth.deleteAddress.mockReset().mockResolvedValue([])
    toast.show.mockClear()
  })

  it('opens create and edit modal with normalized form state', () => {
    const vm = useAddressesViewModel()

    vm.openModal()
    expect(vm.editId.value).toBeNull()
    expect(vm.form.value).toEqual({ label: '', address: '', isDefault: false })
    expect(vm.modal.value).toBe(true)

    vm.modalError.value = 'old'
    vm.openModal(makeAddress({ _id: 'a2', label: 'Офис', address: 'Литейный 2', isDefault: false }))

    expect(vm.editId.value).toBe('a2')
    expect(vm.form.value).toEqual({ label: 'Офис', address: 'Литейный 2', isDefault: false })
    expect(vm.modalError.value).toBe('')
  })

  it('adds and updates address through auth store and closes modal', async () => {
    const vm = useAddressesViewModel()
    vm.openModal()
    vm.form.value = { label: 'Дом', address: 'Невский 1', isDefault: true }

    await vm.save()

    expect(auth.addAddress).toHaveBeenCalledWith({ label: 'Дом', address: 'Невский 1', isDefault: true })
    expect(toast.show).toHaveBeenCalledWith('Адрес добавлен', 'success')
    expect(vm.modal.value).toBe(false)

    vm.openModal(makeAddress({ _id: 'a1' }))
    vm.form.value.address = 'Невский 2'

    await vm.save()

    expect(auth.updateAddress).toHaveBeenCalledWith('a1', { label: 'Дом', address: 'Невский 2', isDefault: true })
    expect(toast.show).toHaveBeenCalledWith('Адрес обновлён', 'success')
  })

  it('confirms deletion and clears pending delete id before API call', async () => {
    const vm = useAddressesViewModel()
    vm.requestDelete('a1')

    await vm.confirmRemove()

    expect(vm.deleteId.value).toBeNull()
    expect(auth.deleteAddress).toHaveBeenCalledWith('a1')
    expect(toast.show).toHaveBeenCalledWith('Адрес удалён', 'success')
  })

  it('sets default address and maps failures to modal/toast messages', async () => {
    auth.updateAddress.mockRejectedValueOnce(new Error('nope'))
    const vm = useAddressesViewModel()

    await vm.setDefault('a1')
    expect(toast.show).toHaveBeenCalledWith('nope', 'error')

    auth.addAddress.mockRejectedValueOnce(new Error('bad address'))
    vm.openModal()
    vm.form.value.address = 'Невский 1'

    await vm.save()
    expect(vm.modalError.value).toBe('bad address')
  })
})
