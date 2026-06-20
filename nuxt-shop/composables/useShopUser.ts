export interface ShopAddress {
  _id:       string
  label:     string
  address:   string
  isDefault: boolean
}

export interface ShopUser {
  _id:          string
  firstName:    string
  lastName:     string
  email:        string
  phone?:       string
  bonusBalance: number
  addresses:    ShopAddress[]
}

export const useShopUser = () => {
  const user    = useState<ShopUser | null>('shop_user', () => null)
  const checked = useState<boolean>('shop_user_checked', () => false)

  async function fetchUser() {
    if (checked.value) return
    try {
      const data = await $fetch<{ ok: boolean; user: ShopUser }>('/api/user/auth/me', {
        credentials: 'include',
      })
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  function clearUser() {
    user.value    = null
    checked.value = true
  }

  function updateBalance(newBalance: number) {
    if (user.value) user.value = { ...user.value, bonusBalance: newBalance }
  }

  return { user, checked, fetchUser, clearUser, updateBalance }
}
