import { nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProfileViewModel, useProfileViewModel, type ProfileViewModelDeps } from '@/composables/useProfileViewModel'
import type { IUser } from '@/types/user-profile-auth'

const { api, auth, toast } = vi.hoisted(() => ({
  api: {
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
  auth: {
    user: null as IUser | null,
    updateUser: vi.fn((user: IUser) => {
      auth.user = user
    }),
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

vi.mock('@/api', () => ({
  api,
  assetUrl: (value: string) => `https://cdn.test/${value}`,
}))

vi.mock('@/composables/useCabinetTier', () => ({
  useCabinetTier: () => ({
    tierName: { value: 'Rose' },
  }),
}))

vi.mock('@/composables/useProfileNotifications', () => ({
  useProfileNotifications: (source: { value: unknown }, persist: (payload: unknown) => Promise<unknown>) => ({
    notif: source.value ?? { orderStatus: true, news: false },
    toggleNotification: persist,
  }),
}))

function makeUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: 'u1',
    email: 'user@example.com',
    firstName: 'Анна',
    lastName: 'Петрова',
    phone: '+79990000000',
    notifications: { orderStatus: true, news: false },
    addresses: [],
    wishlist: [],
    bonusBalance: 1200,
    totalSpent: 10000,
    referralCode: 'REF',
    achievements: ['vip'],
    createdAt: '2026-01-01',
    ...overrides,
  }
}

describe('useProfileViewModel', () => {
  beforeEach(() => {
    auth.user = makeUser()
    auth.updateUser.mockClear()
    toast.show.mockClear()
    api.updateProfile.mockReset()
    api.uploadAvatar.mockReset()
  })

  it('normalizes user data for the personal form', async () => {
    const vm = useProfileViewModel()
    await nextTick()

    expect(vm.form.value).toMatchObject({
      firstName: 'Анна',
      lastName: 'Петрова',
      phone: '+79990000000',
      email: 'user@example.com',
    })
    expect(vm.initials.value).toBe('АП')
    expect(vm.referralCode.value).toBe('REF')
  })

  it('saves profile and syncs auth user from server response', async () => {
    const savedUser = makeUser({ firstName: 'Мария' })
    api.updateProfile.mockResolvedValue({ ok: true, user: savedUser })

    const vm = useProfileViewModel()
    await nextTick()
    vm.form.value.firstName = 'Мария'

    await vm.save()

    expect(api.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Мария' }))
    expect(auth.updateUser).toHaveBeenCalledWith(savedUser)
    expect(vm.success.value).toBe('Профиль обновлён')
    expect(vm.error.value).toBe('')
  })

  it('clears avatar preview and shows a friendly toast on avatar upload failure', async () => {
    api.uploadAvatar.mockRejectedValue(new Error('bad file'))
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:avatar'), revokeObjectURL: vi.fn() })
    const file = new File(['x'], 'avatar.png', { type: 'image/png' })

    const vm = useProfileViewModel()
    await vm.onAvatarSelected(file)

    expect(vm.avatarSrc.value).toBeNull()
    expect(toast.show).toHaveBeenCalledWith('bad file', 'error')

    vi.unstubAllGlobals()
  })
})

function createDeps(overrides: Partial<ProfileViewModelDeps> = {}): ProfileViewModelDeps {
  let counter = 0
  return {
    user: ref<IUser | null>(makeUser()),
    updateUser: vi.fn(),
    updateProfile: vi.fn(async () => ({ user: makeUser() })),
    uploadAvatar: vi.fn(async () => 'https://cdn.test/new-avatar.webp'),
    assetUrl: vi.fn((path) => `https://cdn.test/${path}`),
    createObjectUrl: vi.fn(() => `blob://${++counter}`),
    revokeObjectUrl: vi.fn(),
    showToast: vi.fn(),
    ...overrides,
  }
}

function bigFile() {
  const file = new File(['x'], 'big.png', { type: 'image/png' })
  Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })
  return file
}

describe('createProfileViewModel', () => {
  it('считает initials/fullName/referralCode из user', () => {
    const deps = createDeps()
    const vm = createProfileViewModel(deps)

    expect(vm.initials.value).toBe('АП')
    expect(vm.fullName.value).toBe('Анна Петрова')
    expect(vm.referralCode.value).toBe('REF')
    expect(vm.earnedAchievements.value).toEqual(['vip'])
  })

  it('синхронизирует form из server при инициализации', () => {
    const deps = createDeps({ user: ref(makeUser({ firstName: 'Иван', birthDate: '1990-05-05T00:00:00.000Z' })) })
    const vm = createProfileViewModel(deps)

    expect(vm.form.value.firstName).toBe('Иван')
    expect(vm.form.value.birthDate).toBe('1990-05-05')
  })

  it('avatarSrc отдаёт assetUrl когда нет превью', () => {
    const deps = createDeps({ user: ref(makeUser({ avatar: 'avatars/me.webp' })) })
    const vm = createProfileViewModel(deps)

    expect(vm.avatarSrc.value).toBe('https://cdn.test/avatars/me.webp')
    expect(deps.assetUrl).toHaveBeenCalledWith('avatars/me.webp')
  })

  it('save отправляет поля формы и обновляет user', async () => {
    const updated = makeUser({ firstName: 'Мария' })
    const deps = createDeps({ updateProfile: vi.fn(async () => ({ user: updated })) })
    const vm = createProfileViewModel(deps)

    vm.form.value.firstName = 'Мария'
    vm.form.value.phone = ''
    await nextTick()
    await vm.save()

    expect(deps.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Мария', phone: undefined }))
    expect(deps.updateUser).toHaveBeenCalledWith(updated)
    expect(vm.success.value).toBe('Профиль обновлён')
    expect(vm.error.value).toBe('')
  })

  it('save выставляет error при отказе сервера', async () => {
    const deps = createDeps({ updateProfile: vi.fn(async () => { throw new Error('Сервер недоступен') }) })
    const vm = createProfileViewModel(deps)

    await vm.save()

    expect(vm.error.value).toBe('Сервер недоступен')
    expect(vm.success.value).toBe('')
    expect(deps.updateUser).not.toHaveBeenCalled()
  })

  it('onAvatarSelected отклоняет файл больше 5 МБ', async () => {
    const deps = createDeps()
    const vm = createProfileViewModel(deps)

    await vm.onAvatarSelected(bigFile())

    expect(deps.showToast).toHaveBeenCalledWith('Файл слишком большой (макс. 5 МБ)', 'error')
    expect(deps.uploadAvatar).not.toHaveBeenCalled()
    expect(deps.createObjectUrl).not.toHaveBeenCalled()
  })

  it('onAvatarSelected загружает аватар и показывает превью', async () => {
    const deps = createDeps()
    const vm = createProfileViewModel(deps)
    const file = new File(['a'], 'a.png', { type: 'image/png' })

    await vm.onAvatarSelected(file)

    expect(deps.createObjectUrl).toHaveBeenCalledWith(file)
    expect(deps.uploadAvatar).toHaveBeenCalledWith(file)
    expect(deps.updateProfile).toHaveBeenCalledWith({ avatar: 'https://cdn.test/new-avatar.webp' })
    expect(deps.showToast).toHaveBeenCalledWith('Фото обновлено', 'success')
    expect(vm.avatarSrc.value).toBe('blob://1')
  })

  it('повторный выбор файла освобождает предыдущий blob-URL', async () => {
    const deps = createDeps()
    const vm = createProfileViewModel(deps)

    await vm.onAvatarSelected(new File(['a'], 'a.png', { type: 'image/png' }))
    await vm.onAvatarSelected(new File(['b'], 'b.png', { type: 'image/png' }))

    expect(deps.revokeObjectUrl).toHaveBeenCalledWith('blob://1')
    expect(vm.avatarSrc.value).toBe('blob://2')
  })

  it('ошибка загрузки освобождает свежий blob-URL и сбрасывает превью', async () => {
    const deps = createDeps({ uploadAvatar: vi.fn(async () => { throw new Error('upload failed') }) })
    const vm = createProfileViewModel(deps)

    await vm.onAvatarSelected(new File(['a'], 'a.png', { type: 'image/png' }))

    expect(deps.revokeObjectUrl).toHaveBeenCalledWith('blob://1')
    expect(vm.avatarSrc.value).toBeNull()
    expect(deps.showToast).toHaveBeenCalledWith('upload failed', 'error')
  })

  it('dispose освобождает текущий blob-URL превью', async () => {
    const deps = createDeps()
    const vm = createProfileViewModel(deps)

    await vm.onAvatarSelected(new File(['a'], 'a.png', { type: 'image/png' }))
    vm.dispose()

    expect(deps.revokeObjectUrl).toHaveBeenCalledWith('blob://1')
  })

  it('toggleNotification персистит изменения и обновляет user через deps', async () => {
    const updated = makeUser({ notifications: { orderStatus: true, news: true } })
    const deps = createDeps({ updateProfile: vi.fn(async () => ({ user: updated })) })
    const vm = createProfileViewModel(deps)

    // useProfileNotifications замокан так, что toggleNotification === persist-колбэк,
    // который фабрика собрала из deps.updateProfile + deps.updateUser.
    await vm.toggleNotification({ orderStatus: true, news: true } as never)

    expect(deps.updateProfile).toHaveBeenCalledWith({ notifications: { orderStatus: true, news: true } })
    expect(deps.updateUser).toHaveBeenCalledWith(updated)
  })
})
