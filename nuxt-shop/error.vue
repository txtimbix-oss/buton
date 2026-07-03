<template>
  <div class="page-wrap">
    <AppTopBar />
    <AppHeader />

    <section class="err-section">
      <div>
        <div class="err-code">{{ error?.statusCode ?? 404 }}</div>
        <h1 class="err-h1">
          {{ error?.statusCode === 500 ? 'Что-то пошло не так' : 'Этой страницы<br>не существует' }}
        </h1>
        <p class="lead err-lead">
          {{ error?.statusCode === 500
            ? 'Мы уже работаем над исправлением. Попробуйте обновить страницу.'
            : 'Возможно, букет уже разобрали или ссылка устарела. Вернёмся к свежим цветам?'
          }}
        </p>
        <div class="err-actions">
          <NuxtLink to="/" class="btn btn--ink">На главную <span class="arr">→</span></NuxtLink>
          <NuxtLink to="/catalog" class="btn btn--ghost">В каталог</NuxtLink>
        </div>
      </div>
      <BloomImg kind="peach" class="err-bloom" cap="а пока — немного цветов" />
    </section>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
defineProps<{ error?: { statusCode?: number; statusMessage?: string } | null }>()
useHead({ title: 'Страница не найдена — Бутон' })
</script>

<style scoped>
.err-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 56px;
  padding: 0 60px;
  min-height: 72vh;
}

.err-code {
  font-family: var(--serif);
  font-size: 140px;
  line-height: 1;
  color: var(--clay);
  letter-spacing: -0.02em;
}

.err-h1 {
  font-size: 46px;
  margin: 10px 0 16px;
}

.err-lead {
  max-width: 420px;
  margin-bottom: 30px;
}

.err-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.err-bloom {
  border-radius: 4px;
}

@media (max-width: 1100px) {
  .err-section { grid-template-columns: 1fr; padding: 60px 32px; min-height: auto; }
  .err-section :deep(.bloom) { height: 280px !important; }
}

@media (max-width: 768px) {
  .err-section { padding: 40px 20px; }
  .err-code { font-size: 96px; }
  .err-h1 { font-size: 32px; }
}
</style>
