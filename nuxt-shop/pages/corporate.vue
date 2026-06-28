<template>
  <div class="page-wrap">

    <!-- Герой -->
    <section class="corp-hero">
      <div>
        <div class="breadcrumb corp-hero__breadcrumb">
          <NuxtLink to="/">Главная</NuxtLink> · <span>Корпоративным</span>
        </div>
        <div class="eyebrow corp-hero__eyebrow">B2B-флористика</div>
        <h1 class="corp-hero__title">Цветы для бизнеса<br>и партнёров</h1>
        <p class="lead corp-hero__lead">
          Оформление офисов, корпоративные подарки и мероприятия. Договор, постоплата, персональный менеджер — всё для удобной работы.
        </p>
      </div>
      <BloomImg class="corp-hero__image" kind="green" cap="композиции для офиса" />
    </section>

    <!-- Преимущества -->
    <section class="corp-benefits">
      <div class="grid-3">
          <div v-for="b in benefits" :key="b.title">
          <span class="corp-benefit__icon"><AppIcon :name="b.icon" /></span>
          <h3 class="corp-benefit__title">{{ b.title }}</h3>
          <p class="corp-benefit__text">{{ b.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Форматы сотрудничества -->
    <section class="corp-formats">
      <div class="eyebrow corp-formats__eyebrow">Что мы предлагаем</div>
      <h2 class="corp-formats__title">Форматы сотрудничества</h2>
      <div class="grid-3">
        <div v-for="f in formats" :key="f.title" class="corp-format">
          <h3 class="corp-format__title">{{ f.title }}</h3>
          <p class="corp-format__text">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- B2B-форма -->
    <section class="corp-form-section">
      <div class="corp-form-wrap">
        <div>
          <div class="eyebrow corp-form__eyebrow">Оставьте заявку</div>
          <h2 class="corp-form__title">Обсудим условия<br>для вашей компании</h2>
          <p class="corp-form__desc">
            Менеджер подготовит коммерческое предложение под ваши задачи и объём в течение рабочего дня.
          </p>
        </div>
        <div class="corp-card">
          <Transition name="fade" mode="out-in">
            <div v-if="sent" class="corp-form__success">
              <div class="corp-form__success-emoji">✅</div>
              <h2 class="corp-form__success-title">Заявка принята!</h2>
              <p class="corp-form__success-text">Свяжемся с вами в течение рабочего дня.</p>
            </div>
            <div v-else>
              <div class="corp-form-grid">
                <div class="field"><label>Компания</label><input v-model="form.company" class="input" type="text" placeholder="ООО «Нева»" /></div>
                <div class="field"><label>ИНН</label><input v-model="form.inn" class="input" type="text" placeholder="7801···" /></div>
                <div class="field"><label>Объём заказов</label>
                  <select v-model="form.volume" class="input">
                    <option>от 10 000 ₽/мес</option>
                    <option>от 30 000 ₽/мес</option>
                    <option>от 50 000 ₽/мес</option>
                    <option>от 100 000 ₽/мес</option>
                  </select>
                </div>
                <div class="field"><label>Периодичность</label>
                  <select v-model="form.frequency" class="input">
                    <option>Еженедельно</option>
                    <option>2 раза в месяц</option>
                    <option>Раз в месяц</option>
                    <option>По событиям</option>
                  </select>
                </div>
                <div class="field"><label>Контактное лицо *</label><input v-model="form.name" class="input" type="text" placeholder="Ирина" :class="{'is-active':errors.name}" /></div>
                <div class="field"><label>Телефон *</label><input v-model="form.phone" class="input" type="tel" placeholder="+7 812 ···" :class="{'is-active':errors.phone}" /></div>
              </div>
              <p v-if="apiError" class="corp-form__error">{{ apiError }}</p>
              <button class="btn btn--ink btn--block corp-form__submit" :disabled="loading" @click="submit">
                {{ loading ? 'Отправляем…' : 'Получить предложение →' }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const settings = useSettings()
const { setCanonical } = useSeo()
const { submitInquiry } = usePublicInquirySubmitter()

useSeoMeta(() => ({
  title:       `Цветы для бизнеса — ${settings.value.storeName}`,
  description: `Корпоративная флористика в СПб: оформление офисов, подарки партнёрам, мероприятия. Договор, постоплата, персональный менеджер.`,
}))
setCanonical('/corporate')

const { benefits, formats, form, errors, loading, sent, apiError, submit } = useCorporatePageState({}, {
  submitInquiry,
})
</script>

<style scoped>
.corp-hero {
  display: grid; grid-template-columns: 1.05fr 0.95fr;
  gap: 56px; align-items: center; padding: 0 60px; min-height: 400px;
}
.corp-benefits {
  background: var(--paper-2); padding: 56px 60px;
}
.corp-formats {
  padding: 56px 60px;
  min-height: 340px;
}
.corp-format {
  background: var(--card); border-radius: 4px; padding: 28px;
  box-shadow: 0 1px 3px rgba(32,48,42,.08);
  border-top: 3px solid var(--clay);
}
.corp-form-section {
  background: var(--green); color: #EFE7D2; padding: 60px 60px;
}
.corp-form-wrap {
  display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: center;
}
.corp-card { background: var(--card); color: var(--ink); border-radius: 4px; padding: 32px; }
 .corp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1100px) {
  .corp-hero { grid-template-columns: 1fr; padding: 40px 32px; }
  .corp-benefits { padding: 40px 32px; }
  .corp-formats { padding: 40px 32px; }
  .corp-form-section { padding: 40px 32px; }
  .corp-form-wrap { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .corp-hero { padding: 28px 20px; }
  .corp-hero h1 { font-size: 34px !important; }
  .corp-benefits { padding: 28px 20px; }
  .corp-formats { padding: 28px 20px; }
  .grid-3 { grid-template-columns: 1fr; }
  .corp-form-section { padding: 28px 20px; }
  .corp-form-grid { grid-template-columns: 1fr; }
  
.corp-hero__breadcrumb {
  margin-bottom: 16px;
}
.corp-hero__eyebrow {
  margin-bottom: 14px;
}
.corp-hero__title {
  font-size: 58px;
  margin-bottom: 18px;
}
.corp-hero__lead {
  max-width: 440px;
}
.corp-hero__image {
  height: 340px;
  border-radius: 4px;
}

.corp-benefit__icon {
  color: var(--clay);
}
.corp-benefit__title {
  font-family: var(--serif);
  font-size: 24px;
  margin: 14px 0 10px;
}
.corp-benefit__text {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.65;
}

.corp-formats__eyebrow {
  margin-bottom: 12px;
}
.corp-formats__title {
  font-size: 38px;
  margin-bottom: 26px;
}
.corp-format__title {
  font-family: var(--serif);
  font-size: 24px;
  margin-bottom: 10px;
}
.corp-format__text {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.65;
}

.corp-form__eyebrow {
  color: var(--blush);
  margin-bottom: 12px;
}
.corp-form__title {
  font-size: 42px;
  color: #FFFFFF;
  margin-bottom: 16px;
}
.corp-form__desc {
  font-size: 16px;
  opacity: .85;
  max-width: 420px;
  line-height: 1.65;
}
.corp-form__success {
  text-align: center;
  padding: 20px 0;
}
.corp-form__success-emoji {
  font-size: 48px;
  margin-bottom: 16px;
}
.corp-form__success-title {
  font-size: 26px;
  margin-bottom: 12px;
}
.corp-form__success-text {
  color: var(--muted);
}
.corp-form__error {
  font-size: 13px;
  color: var(--clay);
  margin-top: 10px;
  margin-bottom: 0;
}
.corp-form__submit {
  margin-top: 22px;
}
}
</style>
