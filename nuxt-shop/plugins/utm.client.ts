// Захватывает UTM-параметры при первом заходе и при навигации по сайту.
// Сохраняет в cookie shop_utm на 30 дней — передаётся с заказом из корзины.
export default defineNuxtPlugin(() => {
  const route  = useRoute()
  const router = useRouter()
  const { capture } = useUtm()

  // Захват при начальной загрузке страницы
  capture(route.query as Record<string, string>)

  // Захват при переходах (пользователь мог перейти по UTM-ссылке на любую страницу)
  router.afterEach((to) => {
    capture(to.query as Record<string, string>)
  })
})
