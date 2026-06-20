<template>
  <AppLayout>
    <h1 class="page-title">Избранное</h1>

    <div v-if="loading" class="content-loading"><span class="spinner"></span></div>

    <CabEmptyState
      v-else-if="error && products.length === 0"
      title="Не удалось загрузить избранное"
      :text="error || 'Попробуйте загрузить список ещё раз'"
    >
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r=".75" fill="currentColor" stroke="none"/></svg>
      </template>
      <template #action>
        <button class="btn btn--ghost btn--sm" @click="loadWishlist">Повторить</button>
      </template>
    </CabEmptyState>

    <CabEmptyState
      v-else-if="products.length === 0"
      title="В избранном пока пусто"
      text="Сохраняйте понравившиеся букеты, чтобы не потерять"
    >
      <template #icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z"/></svg>
      </template>
      <template #action>
        <a :href="`${SHOP_URL}/catalog`" class="btn btn--ghost btn--sm">Перейти в каталог</a>
      </template>
    </CabEmptyState>

    <template v-else>
      <WishlistMeta :count="products.length" />
      <WishlistGrid
        :products="products"
        :removing-slug="removing"
        @remove="askConfirm"
      />
    </template>

    <CabConfirmDialog
      :open="!!confirmSlug"
      icon="💔"
      title="Убрать из избранного?"
      text="Товар исчезнет из вашего списка сохранённых"
      confirm-label="Удалить"
      cancel-label="Оставить"
      :loading="removing === confirmSlug"
      @cancel="cancelConfirm"
      @confirm="confirmRemove"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import CabConfirmDialog from '@/components/CabConfirmDialog.vue'
import CabEmptyState from '@/components/CabEmptyState.vue'
import WishlistGrid from '@/components/wishlist/WishlistGrid.vue'
import WishlistMeta from '@/components/wishlist/WishlistMeta.vue'
import { useWishlistViewModel } from '@/composables/useWishlistViewModel'

const {
  SHOP_URL,
  askConfirm,
  cancelConfirm,
  confirmRemove,
  confirmSlug,
  error,
  loadWishlist,
  loading,
  products,
  removing,
} = useWishlistViewModel()
</script>
