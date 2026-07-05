<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <NuxtLink to="/" class="auth-logo"><span class="mk" />Бутон</NuxtLink>
      <div class="auth-eyebrow">300 бонусов за первый заказ</div>
      <h1 class="serif">Создать аккаунт</h1>
      <p class="auth-lead">Регистрация займёт меньше минуты.</p>

      <div v-if="error" class="auth-err">{{ error }}</div>

      <form @submit.prevent="submit" novalidate>
        <div class="auth-row2">
          <label class="auth-fld">
            <span>Имя <i>*</i></span>
            <input v-model.trim="form.firstName" type="text" required autocomplete="given-name" placeholder="Анна" />
          </label>
          <label class="auth-fld">
            <span>Фамилия <i>*</i></span>
            <input v-model.trim="form.lastName" type="text" required autocomplete="family-name" placeholder="Петрова" />
          </label>
        </div>

        <label class="auth-fld">
          <span>Email <i>*</i></span>
          <input v-model.trim="form.email" type="email" required autocomplete="email" placeholder="you@mail.ru" />
        </label>

        <label class="auth-fld">
          <span>Телефон</span>
          <input v-model.trim="form.phone" type="tel" autocomplete="tel" placeholder="+7 900 000-00-00" />
        </label>

        <label class="auth-fld">
          <span>Пароль <i>*</i></span>
          <input v-model="form.password" type="password" required autocomplete="new-password" :minlength="MIN_PW" placeholder="Минимум 8 символов" />
        </label>

        <label class="auth-fld">
          <span>Повторите пароль <i>*</i></span>
          <input v-model="form.confirm" type="password" required autocomplete="new-password" placeholder="Ещё раз пароль" />
          <em v-if="mismatch" class="auth-mismatch">Пароли не совпадают</em>
        </label>

        <button class="auth-btn" type="submit" :disabled="loading || mismatch">
          {{ loading ? 'Создаём…' : 'Создать аккаунт' }}
        </button>
        <p class="auth-fine">Создавая аккаунт, вы принимаете условия использования и политику конфиденциальности.</p>
      </form>

      <div class="auth-below">
        Уже есть аккаунт?
        <NuxtLink :to="loginLink">Войти →</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Регистрация — Бутон', robots: 'noindex, nofollow' })

const MIN_PW = 8
const route = useRoute()
const { user, checked } = useShopUser()

const redirect = computed(() => {
  const r = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return r && String(r).startsWith('/') ? String(r) : '/account'
})
const loginLink = computed(() => {
  const r = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return r ? { path: '/login', query: { redirect: String(r) } } : { path: '/login' }
})
const referralCode = computed(() => {
  const r = Array.isArray(route.query.ref) ? route.query.ref[0] : route.query.ref
  return r ? String(r) : undefined
})

const form = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
const error = ref('')
const loading = ref(false)
const mismatch = computed(() => !!form.confirm && form.confirm !== form.password)

onMounted(async () => {
  try {
    const me: any = await $fetch('/api/user/auth/me', { credentials: 'include' })
    if (me?.user) {
      user.value = me.user
      checked.value = true
      await navigateTo(redirect.value)
    }
  } catch { /* гость */ }
})

async function submit() {
  if (loading.value || mismatch.value) return
  if (!form.firstName || !form.lastName || !form.email || !form.password) {
    error.value = 'Заполните обязательные поля.'
    return
  }
  if (form.password.length < MIN_PW) {
    error.value = `Пароль должен быть не короче ${MIN_PW} символов.`
    return
  }
  error.value = ''
  loading.value = true
  try {
    const res: any = await $fetch('/api/user/auth/register', {
      method: 'POST',
      credentials: 'include',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(referralCode.value ? { referralCode: referralCode.value } : {}),
      },
    })
    user.value = res.user
    checked.value = true
    await navigateTo(redirect.value)
  } catch (e: any) {
    error.value = e?.data?.error || 'Не удалось создать аккаунт. Попробуйте ещё раз.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-wrap {
  min-height: calc(100vh - 220px);
  display: grid;
  place-items: center;
  padding: 40px 20px 80px;
}
.auth-card {
  width: 100%;
  max-width: 460px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--r-md, 16px);
  box-shadow: var(--sh-sm, 0 1px 2px oklch(0.4 0.03 70 / .05), 0 8px 24px oklch(0.4 0.03 70 / .06));
  padding: 34px 32px 30px;
}
.auth-logo {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--serif); font-weight: 600; font-size: 22px;
  color: var(--ink); text-decoration: none; margin-bottom: 22px;
}
.auth-logo .mk { width: 8px; height: 8px; border-radius: 50%; background: var(--clay, oklch(0.72 0.15 52)); }
.auth-eyebrow { font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--green); font-weight: 600; margin-bottom: 8px; }
.auth-card h1 { font-family: var(--serif); font-size: 30px; font-weight: 600; letter-spacing: -.01em; color: var(--ink); }
.auth-lead { color: var(--muted); font-size: 14.5px; line-height: 1.5; margin: 8px 0 22px; }

.auth-err {
  background: oklch(0.95 0.04 25); color: #c0392b; border: 1px solid oklch(0.86 0.06 25);
  border-radius: 10px; padding: 11px 14px; font-size: 13.5px; margin-bottom: 16px; line-height: 1.4;
}

.auth-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 440px) { .auth-row2 { grid-template-columns: 1fr; gap: 0; } }

.auth-fld { display: block; margin-bottom: 15px; }
.auth-fld span { display: block; font-size: 13px; font-weight: 500; color: var(--ink-2, var(--ink)); margin-bottom: 6px; }
.auth-fld span i { color: var(--clay, oklch(0.72 0.15 52)); font-style: normal; }
.auth-fld input {
  width: 100%; height: 48px; border: 1px solid var(--line-strong, var(--line));
  border-radius: 11px; padding: 0 14px; font-size: 15px; font-family: inherit;
  color: var(--ink); background: var(--card); box-sizing: border-box;
}
.auth-fld input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px var(--green-wash, oklch(0.95 0.03 150)); }
.auth-mismatch { display: block; font-size: 12px; color: #c0392b; margin-top: 6px; font-style: normal; }

.auth-btn {
  width: 100%; height: 50px; margin-top: 6px; border: none; border-radius: 12px;
  background: var(--green); color: #fff; font-family: inherit; font-weight: 600; font-size: 15.5px;
  cursor: pointer; transition: background .15s, opacity .15s;
}
.auth-btn:hover { background: var(--green-2, oklch(0.55 0.15 148)); }
.auth-btn:disabled { opacity: .6; cursor: default; }
.auth-fine { font-size: 11px; color: var(--muted); margin-top: 12px; text-align: center; line-height: 1.5; }

.auth-below { margin-top: 20px; text-align: center; font-size: 14px; color: var(--muted); }
.auth-below a { color: var(--green); font-weight: 600; text-decoration: none; }
.auth-below a:hover { text-decoration: underline; }
</style>
