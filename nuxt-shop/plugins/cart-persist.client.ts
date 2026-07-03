// Корзина (useCart) живёт в useState — это in-memory и теряется при перезагрузке.
// Этот клиентский плагин гидрирует корзину из localStorage на старте и сохраняет изменения.
const KEY = 'buton_cart_v1'

export default defineNuxtPlugin(() => {
  const { items } = useCart()

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (Array.isArray(saved) && saved.length) items.value = saved
  } catch {
    /* битый JSON — игнорируем */
  }

  watch(
    items,
    (value) => {
      try { localStorage.setItem(KEY, JSON.stringify(value)) } catch { /* квота/приватный режим */ }
    },
    { deep: true },
  )
})
