<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <NuxtLink to="/" class="auth-logo"><span class="mk" />Бутон</NuxtLink>
      <div class="auth-eyebrow">Личный кабинет</div>
      <h1 class="serif">С возвращением</h1>
      <p class="auth-lead">Войдите, чтобы видеть заказы, бонусы и избранное.</p>

      <div v-if="error" class="auth-err">{{ error }}</div>

      <form @submit.prevent="submit" novalidate>
        <label class="auth-fld">
          <span>Email</span>
          <input v-model.trim="email" type="email" required autocomplete="email" placeholder="you@mail.ru" />
        </label>
        <label class="auth-fld">
          <span>Пароль</span>
          <input v-model="password" type="password" required autocomplete="current-password" placeholder="Ваш пароль" />
        </label>
        <button class="auth-btn" type="submit" :disabled="loading">
          {{ loading ? 'Входим…' : 'Войти' }}
        </button>
      </form>

      <div class="auth-below">
        Нет аккаунта?
        <NuxtLink :to="registerLink">Создать аккаунт →</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Вход — Бутон', robots: 'noindex, nofollow' })

const route = useRoute()
const { user, checked } = useShopUser()

const redirect = computed(() => {
  const r = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return r && String(r).startsWith('/') ? String(r) : '/account'
})
const registerLink = computed(() => {
  const r = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return r ? { path: '/register', query: { redirect: String(r) } } : { path: '/register' }
})

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(async () => {
  // Уже авторизован → сразу в кабинет, форму не показываем.
  try {
    const me: any = await $fetch('/api/user/auth/me', { credentials: 'include' })
    if (me?.user) {
      user.value = me.user
      checked.value = true
      await navigateTo(redirect.value)
    }
  } catch { /* гость — остаёмся на форме */ }
})

async function submit() {
  if (loading.value) return
  if (!email.value || !password.value) {
    error.value = 'Введите email и пароль.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const res: any = await $fetch('/api/user/auth/login', {
      method: 'POST',
      credentials: 'include',
      body: { email: email.value, password: password.value },
    })
    user.value = res.user
    checked.value = true
    await navigateTo(redirect.value)
  } catch (e: any) {
    error.value = e?.data?.error || 'Не удалось войти. Проверьте email и пароль.'
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
  max-width: 430px;
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

.auth-fld { display: block; margin-bottom: 15px; }
.auth-fld span { display: block; font-size: 13px; font-weight: 500; color: var(--ink-2, var(--ink)); margin-bottom: 6px; }
.auth-fld input {
  width: 100%; height: 48px; border: 1px solid var(--line-strong, var(--line));
  border-radius: 11px; padding: 0 14px; font-size: 15px; font-family: inherit;
  color: var(--ink); background: var(--card); box-sizing: border-box;
}
.auth-fld input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px var(--green-wash, oklch(0.95 0.03 150)); }

.auth-btn {
  width: 100%; height: 50px; margin-top: 6px; border: none; border-radius: 12px;
  background: var(--green); color: #fff; font-family: inherit; font-weight: 600; font-size: 15.5px;
  cursor: pointer; transition: background .15s, opacity .15s;
}
.auth-btn:hover { background: var(--green-2, oklch(0.55 0.15 148)); }
.auth-btn:disabled { opacity: .6; cursor: default; }

.auth-below { margin-top: 22px; text-align: center; font-size: 14px; color: var(--muted); }
.auth-below a { color: var(--green); font-weight: 600; text-decoration: none; }
.auth-below a:hover { text-decoration: underline; }
</style>
