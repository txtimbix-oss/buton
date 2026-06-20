<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <div class="footer__logo">{{ settings.storeName }}<b>.</b></div>
          <p>{{ settings.storeTagline }} в {{ settings.storeCity }}. Собираем букеты в день заказа из свежих сезонных цветов.</p>
        </div>

        <div class="footer__cols">
        <div class="footer__col">
            <h4>Магазин</h4>
            <NuxtLink to="/catalog">Каталог букетов</NuxtLink>
            <NuxtLink to="/subscription">Подписка на цветы</NuxtLink>
            <NuxtLink to="/holiday">Праздники</NuxtLink>
            <NuxtLink to="/gift-cards">Подарочные решения</NuxtLink>
            <NuxtLink to="/wishlist">Избранное</NuxtLink>
            <NuxtLink to="/orders/track">Отследить заказ</NuxtLink>
          </div>
          <div class="footer__col">
            <h4>Помощь</h4>
            <NuxtLink to="/delivery">Доставка и оплата</NuxtLink>
            <NuxtLink to="/about">О нас</NuxtLink>
            <NuxtLink to="/care-tips">Уход за цветами</NuxtLink>
            <a href="#">Контакты</a>
            <a href="#">Возврат</a>
          </div>
          <div class="footer__col">
            <h4>Контакты</h4>
            <p>{{ settings.contactPhone }}</p>
            <p>{{ settings.contactAddress }}</p>
            <a v-if="settings.socialTg" :href="settings.socialTg" target="_blank" rel="noopener">Telegram</a>
            <a v-if="settings.socialInst" :href="settings.socialInst" target="_blank" rel="noopener">Instagram</a>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <span>© {{ year }} {{ settings.storeName }} · Все права защищены</span>
        <span class="footer__legal">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Оферта</a>
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const settings = useSettings()
const year = new Date().getFullYear()
</script>

<style scoped>
.footer__legal {
  display: flex;
  gap: 16px;
}
</style>
