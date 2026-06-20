<template>
  <div>
    <section class="collection-why">
      <h2>Почему эта коллекция подходит для подарка</h2>
      <div class="collection-why__grid">
        <article v-for="item in reasons" :key="item.title" class="collection-why__item">
          <div class="collection-why__title">{{ item.title }}</div>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>

    <section class="collection-offer">
      <h2>Как собрать идеальный букет из этой коллекции</h2>
      <p class="collection-offer__text">
        Коллекция «{{ collectionName }}» уже продумана для удобного подарка:
        выбирайте базовый набор, добавьте открытку или аксессуар и отправьте заказ
        в один клик.
      </p>
      <div class="collection-offer__actions">
        <NuxtLink to="/subscription" class="btn btn--ghost">Подписка на букеты</NuxtLink>
        <NuxtLink to="/gift-cards" class="btn btn--ink">Подарочные решения</NuxtLink>
        <NuxtLink :to="customLink" class="btn btn--light">Собрать свой букет</NuxtLink>
      </div>
    </section>

    <section class="collection-trust">
      <article v-for="item in trust" :key="item.title" class="collection-trust__item">
        <div class="collection-trust__title">{{ item.title }}</div>
        <p>{{ item.text }}</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
interface ContentItem { title: string; text: string }

defineProps<{
  collectionName: string
  reasons: ContentItem[]
  trust: ContentItem[]
  customLink: string
}>()
</script>

<style scoped>
.collection-why {
  padding-block: 10px 28px;
}

.collection-why h2 {
  font-size: 28px;
  margin: 0 0 16px;
}

.collection-why__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.collection-why__item {
  padding: 18px;
  border-radius: var(--r-md);
  background: var(--paper-2);
  border: 1px solid var(--line);
}

.collection-why__title {
  font-weight: 600;
  margin-bottom: 8px;
}

.collection-offer {
  padding-block: 16px 24px;
}

.collection-offer__text {
  color: var(--muted);
  line-height: 1.7;
  max-width: 74ch;
}

.collection-offer__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.collection-offer__actions .btn {
  flex: none;
}

.collection-trust {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding-block: 12px 24px;
}

.collection-trust__item {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 16px;
}

.collection-trust__title {
  font-weight: 600;
  margin-bottom: 6px;
}

@media (max-width: 980px) {
  .collection-why__grid {
    grid-template-columns: 1fr;
  }
  .collection-trust {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .collection-why h2 {
    font-size: 24px;
  }
  .collection-trust {
    grid-template-columns: 1fr;
  }
}
</style>
