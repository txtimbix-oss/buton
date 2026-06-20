<template>
  <AppLayout>
    <h1 class="page-title">Мои заказы</h1>
    <p class="page-sub">{{ filtered.length }} {{ pluralOrders(filtered.length) }}</p>

    <!-- Фильтры-чипы -->
    <div class="chips-row">
      <button
        v-for="f in filters" :key="f.value"
        class="fchip" :class="{ 'is-on': activeFilter === f.value }"
        @click="selectFilter(f.value)"
      >{{ f.label }}</button>
    </div>

    <div class="orders-search">
      <input
        v-model="searchQuery"
        class="input"
        type="text"
        placeholder="Поиск по номеру заказа"
        autocomplete="off"
      />
    </div>

    <CabLoadingCards v-if="loading" :count="3" />

    <template v-else>
      <CabEmptyState
        v-if="paginated.length === 0"
        :title="orders.length === 0 ? 'Заказов пока нет' : 'Ничего не найдено'"
        :text="orders.length === 0 ? 'Оформите первый букет в магазине' : 'Попробуйте другой фильтр'"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>
        </template>
        <template v-if="orders.length === 0" #action>
          <a :href="SHOP_URL" class="btn btn--ghost btn--sm">Перейти в магазин</a>
        </template>
      </CabEmptyState>

      <OrdersCardList v-else :orders="paginated" @open="openOrder" />

      <OrdersTable v-if="paginated.length" :orders="paginated" @open="openOrder" />

      <OrdersPagination
        :page="page"
        :page-numbers="pageNumbers"
        :total-pages="totalPages"
        @prev="previousPage"
        @next="nextPage"
        @select="selectPage"
      />
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import CabEmptyState from '@/components/CabEmptyState.vue'
import CabLoadingCards from '@/components/CabLoadingCards.vue'
import OrdersCardList from '@/components/orders/OrdersCardList.vue'
import OrdersPagination from '@/components/orders/OrdersPagination.vue'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import { useOrdersViewModel } from '@/composables/useOrdersViewModel'

const {
  SHOP_URL,
  activeFilter,
  filtered,
  filters,
  loading,
  nextPage,
  openOrder,
  orders,
  page,
  pageNumbers,
  paginated,
  pluralOrders,
  previousPage,
  searchQuery,
  selectFilter,
  selectPage,
  totalPages,
} = useOrdersViewModel()
</script>
