<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- Overlay -->
      <Transition name="cd-fade">
        <div v-if="isOpen" class="overlay is-open" @click="close" />
      </Transition>

      <!-- Drawer -->
      <Transition name="cd-slide">
        <aside v-if="isOpen" class="drawer drawer--sheet drawer--desk-right is-open" aria-label="Корзина">
          <div class="sheet-handle" />
          <div class="drawer__head">
            <h3>Корзина <span v-if="cartCount > 0" class="drawer-count">{{ cartCount }}</span></h3>
            <button class="xbtn" aria-label="Закрыть" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>
          </div>

          <!-- Пустая корзина -->
          <div v-if="!items.length" class="drawer__body drawer-empty">
            <span class="drawer-empty__ico">🌿</span>
            <p class="drawer-empty__text">Корзина пуста</p>
            <NuxtLink to="/catalog" class="btn btn--ink" @click="close">В каталог →</NuxtLink>
          </div>

          <!-- Строки товаров -->
          <div v-else class="drawer__body">
            <div
              v-for="item in items"
              :key="item.lineId"
              class="miniline"
            >
              <NuxtLink :to="`/product/${item.slug}`" class="miniline__link" @click="close">
                <div class="miniline__img">
                  <ShopImg v-if="item.image" :src="item.image" :alt="item.name" eager sizes="60px" />
                  <BloomImg v-else :kind="item.bloom" />
                </div>
                <div>
                  <div class="miniline__name">{{ item.name }}</div>
                  <div class="miniline__meta">{{ item.meta }}</div>
                  <div v-if="item.addons?.length" class="miniline__addons">
                    <span v-for="a in item.addons" :key="a" class="miniline__addon-chip">+ {{ a }}</span>
                  </div>
                  <div class="miniline__price">{{ formatRub(item.price * item.qty) }}</div>
                </div>
              </NuxtLink>
              <div class="miniline__right">
                <button class="linkbtn" aria-label="Удалить" @click="handleRemove(item.lineId)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>
                </button>
                <div class="qty">
                  <button @click="item.qty > 1 ? setLineQty(item.lineId, item.qty - 1) : handleRemove(item.lineId)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>
                  </button>
                  <span>{{ item.qty }}</span>
                  <button @click="setLineQty(item.lineId, item.qty + 1)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Undo удаления -->
          <Transition name="undo-slide">
            <div v-if="pendingRemoval" class="undo-bar">
              <span>Товар удалён</span>
              <button class="undo-btn" @click="undoRemove">Отменить</button>
            </div>
          </Transition>

          <!-- Итог -->
          <div v-if="items.length" class="drawer__foot">
            <div class="drawer-total">
              <span class="drawer-total__label">Итого</span>
              <strong class="drawer-total__sum">{{ formatRub(subtotal) }}</strong>
            </div>
            <NuxtLink to="/cart" class="btn btn--ink btn--block btn--lg" @click="close">
              Оформить заказ →
            </NuxtLink>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { CartItem } from '~/composables/useCart'

const { isOpen, close } = useCartDrawer()
const settings = useSettings()
const { items, cartCount, addLine, removeLine, setLineQty } = useCart()
const { subtotal } = useCartQuote({ items, settings })

interface PendingRemoval { item: CartItem; timer: ReturnType<typeof setTimeout> }
const pendingRemoval = ref<PendingRemoval | null>(null)

function handleRemove(lineId: string) {
  if (pendingRemoval.value) {
    clearTimeout(pendingRemoval.value.timer)
    pendingRemoval.value = null
  }
  const item = items.value.find(entry => entry.lineId === lineId)
  if (!item) return

  removeLine(lineId)
  const timer = setTimeout(() => { pendingRemoval.value = null }, 5000)
  pendingRemoval.value = { item: { ...item, addons: [...item.addons] }, timer }
}

function undoRemove() {
  if (!pendingRemoval.value) return
  clearTimeout(pendingRemoval.value.timer)
  addLine(pendingRemoval.value.item)
  pendingRemoval.value = null
}

onUnmounted(() => { if (pendingRemoval.value) clearTimeout(pendingRemoval.value.timer) })

function formatRub(n: number) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽'
}
</script>

<style scoped>
/* Overlay */
.cd-fade-enter-active, .cd-fade-leave-active { transition: opacity .28s; }
.cd-fade-enter-from, .cd-fade-leave-to       { opacity: 0; }

/* Drawer — снизу на мобиле */
.cd-slide-enter-active { transition: transform .34s cubic-bezier(.22,1,.36,1); }
.cd-slide-leave-active { transition: transform .26s ease-in; }
.cd-slide-enter-from,
.cd-slide-leave-to     { transform: translateY(101%); }

/* Drawer — справа на десктопе */
@media (min-width: 1101px) {
  .cd-slide-enter-from,
  .cd-slide-leave-to { transform: translateX(101%); }
}

/* Кликабельный товар */
.miniline__link {
  display: contents;
  color: inherit;
  text-decoration: none;
}
.miniline__img :deep(img) {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; border-radius: inherit;
}
.miniline__link:hover .miniline__name { text-decoration: underline; text-underline-offset: 2px; }

/* Undo-бар */
.undo-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px;
  background: var(--ink);
  color: #EFE7D2;
  font-size: 14px;
  flex-shrink: 0;
}
.undo-btn {
  background: none;
  border: 1px solid rgba(255,255,255,.35);
  color: inherit;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background .15s;
}
.undo-btn:hover { background: rgba(255,255,255,.1); }

.undo-slide-enter-active, .undo-slide-leave-active { transition: all .2s; max-height: 48px; overflow: hidden; }
.undo-slide-enter-from, .undo-slide-leave-to { opacity: 0; max-height: 0; }

/* Дополнения в мини-корзине */
.miniline__addons { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.miniline__addon-chip {
  font-size: 11px;
  color: var(--green);
  background: #E8F0EB;
  border-radius: 3px;
  padding: 2px 6px;
  font-weight: 500;
  white-space: nowrap;
}

.drawer-count { font-size: 16px; font-weight: 400; color: var(--muted); }
.drawer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 48px 20px;
}
.drawer-empty__ico { font-size: 44px; opacity: .45; }
.drawer-empty__text { color: var(--muted); }
.drawer-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; }
.drawer-total__label { color: var(--muted); }
.drawer-total__sum { font-family: var(--serif); font-size: 22px; }
</style>
