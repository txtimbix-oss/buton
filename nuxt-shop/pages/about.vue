<template>
  <main class="page">

    <!-- ГЕРОЙ -->
    <section class="sec">
      <div class="container about-hero">
        <div>
          <span class="eyebrow">{{ settings.aboutHeroEyebrow }}</span>
            <h1 class="h-hero">
              {{ settings.storeName }} — это<br>
            <em class="about__hero-accent">{{ settings.aboutHeroTitle }}</em>
          </h1>
          <p class="lead about__hero-text">{{ settings.aboutHeroText }}</p>
        </div>
        <div class="about__hero-image">
          <BloomImg kind="green" :label="settings.contactAddress" />
        </div>
      </div>
    </section>

    <!-- ИСТОРИЯ -->
    <section class="sec sec--notop">
      <div class="container">
      <div class="story-grid">
        <div>
          <div class="eyebrow">{{ settings.aboutStoryEyebrow }}</div>
          <h2 class="h-block about__section-title">{{ settings.aboutStoryTitle }}</h2>
          <p v-if="settings.aboutStoryP1" class="body-lg about__story-text">{{ settings.aboutStoryP1 }}</p>
          <p v-if="settings.aboutStoryP2" class="body-lg about__story-text">{{ settings.aboutStoryP2 }}</p>
          <p v-if="settings.aboutStoryP3" class="body-lg">{{ settings.aboutStoryP3 }}</p>
        </div>
        <div v-if="timeline.length">
          <div class="timeline">
            <div v-for="ev in timeline" :key="ev.year" class="timeline__item">
              <div class="timeline__year">{{ ev.year }}</div>
              <div class="timeline__text">{{ ev.text }}</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>

    <!-- КАК ВЫБИРАЕМ ЦВЕТЫ -->
    <section v-if="howWeChoose.length" class="sec sec--notop">
      <div class="container">
        <span class="eyebrow">{{ settings.aboutHowWeChooseTitle || 'Как мы выбираем цветы' }}</span>
        <h2 class="h-section about__section-title--lg">{{ settings.aboutHowWeChooseTitle || 'Как мы выбираем цветы' }}</h2>
        <ol class="about-steps">
          <li v-for="(step, index) in howWeChoose" :key="step.title" class="about-step">
            <div class="about-step__index">{{ index + 1 }}</div>
            <div class="about-step__content">
              <h3>{{ step.title }}</h3>
              <p class="body-sm">{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- ПОЧЕМУ МЫ -->
    <section v-if="whyUs.length" class="sec sec--notop">
      <div class="container">
        <span class="eyebrow eyebrow--center">{{ settings.aboutWhyUsTitle || 'Почему мы' }}</span>
        <h2 class="h-section text-center about__section-title--lg">{{ settings.aboutWhyUsTitle || 'Почему мы' }}</h2>
        <div class="whyus-grid">
          <div v-for="item in whyUs" :key="item.title" class="value-card">
            <span class="value-icon about__value-icon"><AppIcon :name="item.icon" /></span>
            <h3 class="h-card about__card-title">{{ item.title }}</h3>
            <p class="body-sm">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- КОМАНДА -->
    <section v-if="team.length" class="sec sec--notop">
      <div class="container">
      <span class="eyebrow">{{ settings.aboutTeamEyebrow }}</span>
      <h2 class="h-section about__section-title--xl">Команда</h2>
      <div class="team-grid">
        <div v-for="member in team" :key="member.name" class="team-card">
          <BloomImg :kind="member.bloom" class="about__team-image" />
          <div class="about__team-content">
            <div class="text-serif about__team-name">{{ member.name }}</div>
            <div class="body-sm about__team-role">{{ member.role }}</div>
            <p class="body-sm about__team-bio">{{ member.bio }}</p>
          </div>
        </div>
      </div>
      </div>
    </section>

    <!-- ЦЕННОСТИ -->
    <section v-if="values.length" class="sec sec--notop">
      <div class="container">
      <span class="eyebrow eyebrow--center">{{ settings.aboutValuesEyebrow }}</span>
        <h2 class="h-section text-center about__section-title--xl">{{ settings.aboutValuesTitle }}</h2>
        <div class="values-grid">
          <div v-for="v in values" :key="v.title" class="value-card">
            <span class="value-icon about__value-icon"><AppIcon :name="v.icon" /></span>
            <h3 class="h-card about__card-title">{{ v.title }}</h3>
            <p class="body-sm">{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- КОНТАКТЫ -->
    <section class="sec sec--notop">
      <div class="container">
      <div class="contacts-grid">
        <div>
          <div class="eyebrow">Где нас найти</div>
            <h2 class="h-block about__section-title">Контакты</h2>
            <div class="contact-rows">
              <div class="contact-row">
                <AppIcon name="pin" />
                <div>
                  <div class="about__contact-title">Шоу-рум и самовывоз</div>
                  <div class="about__contact-value">{{ settings.contactAddress }}</div>
                </div>
              </div>
              <div class="contact-row">
                <AppIcon name="clock" />
                <div>
                  <div class="about__contact-title">Режим работы</div>
                  <div class="about__contact-value">{{ settings.contactHours }}</div>
                </div>
              </div>
              <div class="contact-row">
                <AppIcon name="leaf" />
                <div>
                  <div class="about__contact-title">Телефон и мессенджеры</div>
                  <div class="about__contact-value">{{ settings.contactPhone }}</div>
                </div>
              </div>
              <div class="contact-row">
                <AppIcon name="gift" />
                <div>
                  <div class="about__contact-title">Email</div>
                  <div class="about__contact-value">{{ settings.contactEmail }}</div>
                </div>
              </div>
            </div>
          <div class="about__contact-actions">
            <NuxtLink to="/catalog" class="btn btn--ink">Смотреть каталог <span class="arr">→</span></NuxtLink>
            <NuxtLink to="/delivery" class="btn btn--ghost">Доставка</NuxtLink>
          </div>
        </div>
        <div>
          <div class="about__map">
            <BloomImg kind="mix" :label="settings.contactAddress" />
          </div>
        </div>
      </div>
      </div>
    </section>

  </main>
</template>

<script setup lang="ts">
const settings = useSettings()
const { setCanonical, jsonLd, orgSchema } = useSeo()

useSeoMeta(() => ({
  title:         `О нас — ${settings.value.storeName}`,
  description:   settings.value.metaDescAbout,
  ogTitle:       `О нас — ${settings.value.storeName}`,
  ogDescription: settings.value.metaDescAbout,
}))

setCanonical('/about')
jsonLd(orgSchema())

const { timeline, team, values, howWeChoose, whyUs } = useAboutPageContent(settings)
</script>

<style scoped>
.about-hero { display:grid;gap:28px;align-items:center; }
.story-grid    { display:grid;gap:36px; }
.contacts-grid { display:grid;gap:36px; }
.timeline { display:flex;flex-direction:column; }
.timeline__item { display:grid;grid-template-columns:70px 1fr;gap:20px;padding:18px 0;border-bottom:1px solid var(--line); }
.timeline__year { font-family:var(--serif);font-size:20px;color:var(--clay);padding-top:2px; }
.timeline__text { font-size:15px;line-height:1.65;color:var(--muted); }
.team-grid   { display:grid;grid-template-columns:repeat(2,1fr);gap:24px; }
  .values-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:24px; }
.value-card  { padding:24px;background:var(--white);border-radius:var(--r-md);border:1px solid var(--line); }
.value-icon  { display:block;margin-bottom:8px;color:var(--green); }
.contact-rows{ display:flex;flex-direction:column;gap:20px;margin-top:8px; }
.contact-row { display:flex;gap:14px;align-items:flex-start;color:var(--ink); }
.about-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
.about-step {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  padding: 18px;
}
.about-step__index {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--sand);
  color: var(--clay);
  font-weight: 700;
}
.about-step__content h3 { margin: 0 0 8px; }
.about-step__content p { margin: 0; }
  .whyus-grid { display: grid; gap: 24px; }
  .about__hero-accent { font-style: italic; color: var(--clay); }
  .about__hero-text { max-width: 500px; }
  .about__hero-image {
    height: clamp(280px,50vw,520px);
    border-radius: var(--r-lg);
    overflow: hidden;
  }
  .about__section-title {
    margin-bottom: 22px;
  }
  .about__story-text {
    margin-bottom: 18px;
  }
  .about__section-title--lg {
    margin-bottom: 34px;
  }
  .about__section-title--xl {
    margin-bottom: 40px;
  }
  .about__value-icon {
    color: var(--clay);
  }
  .about__card-title {
    margin: 14px 0 8px;
  }
  .about__team-image {
    height: 240px;
    border-radius: 3px;
  }
  .about__team-content {
    padding: 18px 0 0;
  }
  .about__team-name {
    font-size: 20px;
  }
  .about__team-role {
    margin-top: 4px;
  }
  .about__team-bio {
    margin-top: 10px;
  }
  .about__contact-title {
    font-weight: 600;
  }
  .about__contact-value {
    font-size: 14px;
    color: var(--muted);
    margin-top: 3px;
  }
  .about__contact-actions {
    margin-top: 28px;
    display: flex;
    gap: 12px;
  }
  .about__map {
    height: 360px;
    border-radius: var(--r-lg);
    overflow: hidden;
  }
@media (min-width: 700px) {
  .team-grid   { grid-template-columns:repeat(4,1fr); }
  .values-grid { grid-template-columns:repeat(3,1fr); }
  .whyus-grid  { grid-template-columns:repeat(4,1fr); }
}
@media (min-width: 1101px) {
  .about-hero    { grid-template-columns:1fr 0.9fr;gap:60px; }
  .story-grid    { grid-template-columns:1fr 1fr;gap:60px;align-items:start; }
  .contacts-grid { grid-template-columns:1fr 1fr;gap:60px; }
}
</style>
