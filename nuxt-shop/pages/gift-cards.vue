<template>
  <main class="page">
    <section class="sec">
      <div class="container">
        <div class="gift-hero">
          <div>
            <div class="breadcrumb">
              <NuxtLink to="/">Главная</NuxtLink>
              <span class="sep">·</span>
              <span>Сертификаты</span>
            </div>
            <div class="eyebrow gift-hero__eyebrow">Подарочный сертификат</div>
            <h1 class="h-page gift-hero__title">
              Подарите выбор —<br>цветы на любой вкус
            </h1>
            <p class="lead gift-hero__lead">
              Получатель сам выберет букет из каталога. Сертификат приходит на email или печатается в красивой открытке.
            </p>
          </div>
          <div class="gift-preview">
            <div class="gift-preview__frame">
              <BloomImg :kind="nominals[activeNominal] === 'Своя' ? 'mix' : 'rose'" class="gift-preview__photo" :cap="`Номинал ${nominals[activeNominal]}`" />
              <div class="gift-preview__meta">
              <div class="gift-preview__label">Подарочный сертификат</div>
              <div class="gift-preview__amount">{{ currentAmount.toLocaleString('ru-RU') }} ₽</div>
              <div class="gift-preview__status">{{ currentAmount ? 'Актуальный номинал в обработке' : 'Выберите сумму' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="container">
        <div class="sec__head gift-sec-head">
          <div>
            <div class="eyebrow gift-step-subtitle">Шаг 1</div>
            <h2 class="h-section">Выберите номинал</h2>
          </div>
        </div>
        <div class="gc-nominals">
          <button
            v-for="(n, i) in nominals"
            :key="n"
            type="button"
            class="gc-nominal"
            :class="{ active: activeNominal === i }"
            @click="selectNominal(i)"
          >
            <span class="text-serif">{{ n }}{{ n !== 'Своя' ? ' ₽' : '' }}</span>
          </button>
        </div>
        <div v-if="nominals[activeNominal] === 'Своя'" class="field gift-nominals__custom">
          <label>Укажите сумму</label>
          <input v-model="customAmount" class="input" type="number" min="500" max="50000" placeholder="Например, 7 500" />
        </div>
      </div>
    </section>

    <section class="sec sec--bg2">
      <div class="container">
        <div class="sec__head gift-sec-head">
          <div>
            <div class="eyebrow gift-step-subtitle">Шаг 2</div>
            <h2 class="h-section">Оформление открытки</h2>
          </div>
        </div>
        <div class="grid-cards">
          <article
            v-for="(d, i) in designs"
            :key="d.kind"
            class="gc-design"
            :class="{ active: activeDesign === i }"
            @click="activeDesign = i"
          >
            <BloomImg :kind="d.kind" class="gift-design__image" :cap="d.name" />
          </article>
        </div>
      </div>
    </section>

    <section class="sec">
      <div class="container">
        <div class="sec__head gift-sec-head">
          <div>
            <div class="eyebrow gift-step-subtitle">Шаг 3</div>
            <h2 class="h-section">Кому и от кого</h2>
          </div>
        </div>
        <Transition name="fade" mode="out-in">
          <div v-if="sent" class="gift-success">
            <div class="gift-success__icon">🎁</div>
            <h2 class="h-block">Сертификат оформлен!</h2>
            <p class="gift-success__text">
              Проверьте почту — письмо с инструкцией придёт в течение 5 минут.
            </p>
            <NuxtLink to="/" class="btn btn--ink">На главную <span class="arr">→</span></NuxtLink>
          </div>
          <div v-else class="gift-form">
            <div class="field"><label>От кого</label><input v-model="form.from" class="input" type="text" placeholder="Алексей" /></div>
            <div class="field"><label>Кому</label><input v-model="form.to" class="input" type="text" placeholder="Ольга" /></div>
            <div class="field">
              <label>Пожелание в открытке</label>
              <textarea v-model="form.wish" class="input area" placeholder="С праздником! Пусть цветы радуют так же, как ты радуешь нас 🌸" />
            </div>
            <div class="field"><label>Email получателя</label><input v-model="form.email" class="input" type="email" placeholder="olga@example.com" /></div>
            <div class="field">
              <label>Формат</label>
              <select v-model="form.format" class="input">
                <option value="digital">Электронный · сразу на email</option>
                <option value="print">Для печати · PDF</option>
              </select>
            </div>
            <div>
              <p v-if="apiError" class="gift-form__error">{{ apiError }}</p>
              <button class="btn btn--ink" :disabled="loading" @click="submit">
                {{ loading ? 'Оформляем…' : `Оплатить сертификат · ${currentAmount.toLocaleString('ru-RU')} ₽` }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useGiftCardsPageState } from '~/composables/useGiftCardsPageState'

const settings = useSettings()
const { setCanonical } = useSeo()
const { submitInquiry } = usePublicInquirySubmitter()

useSeoMeta(() => ({
  title:       `Подарочные сертификаты — ${settings.value.storeName}`,
  description: `Подарочный сертификат на букет. Выберите номинал, оформите открытку — получатель сам выберет цветы.`,
}))
setCanonical('/gift-cards')

const {
  nominals,
  designs,
  activeNominal,
  activeDesign,
  customAmount,
  currentAmount,
  form,
  loading,
  sent,
  apiError,
  selectNominal,
  submit,
} = useGiftCardsPageState({}, {
  submitInquiry,
})
</script>

<style scoped>
.gift-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 46px;
  align-items: center;
}
.gift-preview {
  display: grid;
  align-items: stretch;
  background: var(--green);
  border-radius: var(--r-md);
  color: #FBF7EE;
  min-height: 320px;
}
.gift-preview__frame {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  overflow: hidden;
  padding: 24px;
}
.gift-preview__photo { height: 220px; border-radius: 4px; }
.gift-preview__meta { padding-top: 16px; }
.gift-hero__eyebrow { margin-bottom: 14px; }
.gift-hero__title { margin-bottom: 18px; }
.gift-hero__lead { max-width: 440px; }
.gift-preview__label {
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;
  margin-top: 4px;
  opacity: .85;
  color: #efe7d2;
}
.gift-preview__amount { font-size: 44px; color: #FBF7EE; }
.gift-preview__status { font-size: 14px; opacity: .82; }
.gift-sec-head { align-items: start; }
.gift-step-subtitle { margin-bottom: 12px; }
.gift-nominals__custom { margin-top: 16px; max-width: 280px; }
.gift-design__image { height: 180px; border-radius: 4px; }
.gift-success__icon { font-size: 48px; margin-bottom: 16px; }
.gift-success__text { color: var(--muted); margin-bottom: 24px; }
.gift-form__error { font-size: 13px; color: var(--clay); margin-bottom: 10px; }

.gc-nominals {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.gc-nominal {
  border: 1.5px solid var(--line);
  border-radius: 3px;
  padding: 24px 12px;
  background: var(--paper-3);
  text-align: center;
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.gc-nominal:hover { border-color: var(--green-2); }
.gc-nominal.active { border-color: var(--green); background: #F1EDDF; }

.gc-design { cursor: pointer; }
.gc-design.active :deep(.bloom) { box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--green); }

.gift-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 860px; }
.gift-form textarea.input { min-height: 110px; resize: vertical; }
.gift-success { text-align: center; padding: 20px 0; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1100px) {
  .gift-hero { grid-template-columns: 1fr; }
  .gc-nominals { grid-template-columns: repeat(3, 1fr); }
  .gift-form { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .gc-nominals { grid-template-columns: repeat(2, 1fr); }
  .gift-form { grid-template-columns: 1fr; }
}
</style>
