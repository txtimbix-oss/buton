import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import { api, assetUrl } from '@/api'
import type { ProfileForm, ProfileNotifications } from '@/components/profile/types'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { useCabinetTier } from '@/composables/useCabinetTier'
import { useProfileNotifications } from '@/composables/useProfileNotifications'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { IUser, UpdateProfilePayload } from '@/types/user-profile-auth'

const EMPTY_FORM: ProfileForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthDate: '',
  gender: '',
}

function cloneForm(value: ProfileForm): ProfileForm {
  return { ...value }
}

function sameForm(a: ProfileForm, b: ProfileForm): boolean {
  return a.firstName === b.firstName
    && a.lastName === b.lastName
    && a.phone === b.phone
    && a.email === b.email
    && a.birthDate === b.birthDate
    && a.gender === b.gender
}

function normalizeForm(user: IUser): ProfileForm {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
    email: user.email,
    birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
    gender: user.gender ?? '',
  }
}

function normalizeNotifications(user: IUser): ProfileNotifications {
  return {
    orderStatus: user.notifications?.orderStatus ?? true,
    news: user.notifications?.news ?? false,
  }
}

export interface ProfileViewModelDeps {
  user: Ref<IUser | null>
  updateUser: (user: IUser) => void
  updateProfile: (payload: UpdateProfilePayload) => Promise<{ user: IUser }>
  uploadAvatar: (file: File) => Promise<string>
  assetUrl: (path: string | null | undefined) => string
  createObjectUrl: (file: File) => string
  revokeObjectUrl: (url: string) => void
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

/**
 * Testable core профиля. Внешние эффекты (api, assetUrl, object URL, toast,
 * auth.updateUser) приходят через `deps`. Дополнительно следит, чтобы blob-URL
 * превью аватара не утекал при повторном выборе/ошибке/размонтировании.
 */
export function createProfileViewModel(deps: ProfileViewModelDeps) {
  const { tierName } = useCabinetTier(computed(() => deps.user.value?.totalSpent))

  const form = ref<ProfileForm>({ ...EMPTY_FORM })
  const syncedForm = ref<ProfileForm>({ ...EMPTY_FORM })
  const formDirty = ref(false)
  const saving = ref(false)
  const success = ref('')
  const error = ref('')
  const previewUrl = ref<string | null>(null)
  const avatarUploading = ref(false)

  function setPreview(next: string | null) {
    if (previewUrl.value && previewUrl.value !== next) {
      deps.revokeObjectUrl(previewUrl.value)
    }
    previewUrl.value = next
  }

  function applySyncedForm(next: ProfileForm, force = false) {
    syncedForm.value = cloneForm(next)
    if (force || !formDirty.value) {
      form.value = cloneForm(next)
      formDirty.value = false
    }
  }

  const initials = computed(() => {
    const user = deps.user.value
    if (!user) return '?'
    return (user.firstName[0] ?? '') + (user.lastName[0] ?? '')
  })

  const avatarSrc = computed(() => {
    if (previewUrl.value) return previewUrl.value
    return deps.user.value?.avatar ? deps.assetUrl(deps.user.value.avatar) : null
  })

  const fullName = computed(() => `${deps.user.value?.firstName ?? ''} ${deps.user.value?.lastName ?? ''}`.trim())
  const earnedAchievements = computed(() => deps.user.value?.achievements ?? [])
  const referralCode = computed(() => deps.user.value?.referralCode)
  const serverForm = computed<ProfileForm | null>(() => deps.user.value ? normalizeForm(deps.user.value) : null)
  const serverNotifications = computed<ProfileNotifications | null>(() => deps.user.value ? normalizeNotifications(deps.user.value) : null)

  const { notif, toggleNotification } = useProfileNotifications(serverNotifications, async (payload) => {
    const res = await deps.updateProfile({ notifications: payload })
    deps.updateUser(res.user)
    return normalizeNotifications(res.user)
  })

  watch(serverForm, (next) => {
    if (!next) return
    applySyncedForm(next)
  }, { immediate: true })

  watch(form, (next) => {
    formDirty.value = !sameForm(next, syncedForm.value)
  }, { deep: true })

  function reset() {
    form.value = cloneForm(syncedForm.value)
    formDirty.value = false
    success.value = ''
    error.value = ''
  }

  async function save() {
    saving.value = true
    success.value = ''
    error.value = ''

    try {
      const res = await deps.updateProfile({
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        phone: form.value.phone || undefined,
        email: form.value.email || undefined,
        birthDate: form.value.birthDate || undefined,
        gender: form.value.gender || undefined,
      })
      applySyncedForm(normalizeForm(res.user), true)
      deps.updateUser(res.user)
      success.value = 'Профиль обновлён'
    } catch (cause: unknown) {
      error.value = getErrorMessage(cause, 'Не удалось сохранить профиль. Проверьте данные и попробуйте ещё раз.')
    } finally {
      saving.value = false
    }
  }

  async function onAvatarSelected(file: File) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      deps.showToast('Файл слишком большой (макс. 5 МБ)', 'error')
      return
    }

    setPreview(deps.createObjectUrl(file))
    avatarUploading.value = true

    try {
      const url = await deps.uploadAvatar(file)
      const res = await deps.updateProfile({ avatar: url })
      deps.updateUser(res.user)
      deps.showToast('Фото обновлено', 'success')
    } catch (cause: unknown) {
      setPreview(null)
      deps.showToast(getErrorMessage(cause, 'Не удалось обновить фото. Проверьте размер и формат файла.'), 'error')
    } finally {
      avatarUploading.value = false
    }
  }

  function handleReferralCopied() {
    deps.showToast('Ссылка скопирована', 'success')
  }

  function dispose() {
    setPreview(null)
  }

  return {
    avatarSrc,
    avatarUploading,
    dispose,
    earnedAchievements,
    error,
    form,
    fullName,
    handleReferralCopied,
    initials,
    notif,
    onAvatarSelected,
    referralCode,
    reset,
    save,
    saving,
    success,
    tierName,
    toggleNotification,
  }
}

/**
 * Runtime wrapper: подставляет реальные auth/api/assetUrl/object URL/toast и
 * освобождает blob-URL превью при размонтировании.
 */
export function useProfileViewModel() {
  const auth = useAuthStore()
  const toast = useToastStore()

  const viewModel = createProfileViewModel({
    user: computed(() => auth.user),
    updateUser: user => auth.updateUser(user),
    updateProfile: payload => api.updateProfile(payload),
    uploadAvatar: file => api.uploadAvatar(file),
    assetUrl,
    createObjectUrl: file => URL.createObjectURL(file),
    revokeObjectUrl: url => URL.revokeObjectURL(url),
    showToast: (message, type) => toast.show(message, type),
  })

  onUnmounted(viewModel.dispose)

  return viewModel
}
