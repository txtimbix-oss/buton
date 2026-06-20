import { computed, type Ref } from 'vue'
import { api } from '@/api'
import type { AddressPayload, IAddress } from '@/types/user-address'
import type { IUser } from '@/types/user-profile-auth'

interface AuthAddressBoundaryOptions {
  user: Ref<IUser | null>
  mergeUserPatch: (patch: Partial<IUser>) => void
}

export function createAuthAddressBoundary({ user, mergeUserPatch }: AuthAddressBoundaryOptions) {
  const addresses = computed(() => user.value?.addresses ?? [])

  function syncAddresses(nextAddresses: IAddress[]) {
    mergeUserPatch({ addresses: nextAddresses })
  }

  async function syncAddressCollection(action: () => Promise<{ addresses: IAddress[] }>) {
    const { addresses: nextAddresses } = await action()
    syncAddresses(nextAddresses)
    return nextAddresses
  }

  async function addAddress(address: AddressPayload) {
    return syncAddressCollection(() => api.addAddress(address))
  }

  async function updateAddress(id: string, address: Partial<AddressPayload>) {
    return syncAddressCollection(() => api.updateAddress(id, address))
  }

  async function deleteAddress(id: string) {
    return syncAddressCollection(() => api.deleteAddress(id))
  }

  return {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
  }
}
