import type {
  SubscriptionPlan,
  SubscriptionForm,
  SubscriptionReview,
  SubscriptionStep,
} from '~/lib/subscription/types'

export const subscriptionSteps: SubscriptionStep[] = [
  { n: '01', title: 'Выберите ритм', text: 'Подберите удобный вариант: 1, 2 или 4 букета в месяц.' },
  { n: '02', title: 'Укажите вкусы', text: 'Задайте цветовую гамму и предпочтения, флорист соберёт сезонный букет под них.' },
  { n: '03', title: 'Получайте цветы', text: 'Найденный букет отправляем в нужный день и время, фото пришлём до фактической доставки.' },
]

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly-1',
    title: '1 букет в месяц',
    price: 2900,
    period: '/ месяц',
    popular: false,
    features: [
      'Сезонный букет 25–35 стеблей',
      'Фото перед отправкой',
      'Пауза и отмена без штрафов',
      'Доставка в день заказа',
    ],
  },
  {
    id: 'monthly-2',
    title: '2 букета в месяц',
    price: 5400,
    period: '/ месяц',
    popular: true,
    features: [
      'Сезонный букет 35–45 стеблей',
      'Фото перед отправкой',
      'Открытка по выбору бесплатно',
      'Гарантия свежести 7 дней',
      'Пауза и отмена без штрафов',
    ],
  },
  {
    id: 'monthly-4',
    title: '4 букета в месяц',
    price: 9800,
    period: '/ месяц',
    popular: false,
    features: [
      'Премиум-сборка 40–55 стеблей',
      'Авторская упаковка в подарок',
      'Фото перед каждой отправкой',
      'Персональный флорист и приоритетная смена времени',
      'Пауза и отмена без штрафов',
    ],
  },
]

export const subscriptionWeekDays = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
]

export const subscriptionTimeOptions = [
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
]

export const subscriptionReviews: SubscriptionReview[] = [
  {
    name: 'Марина Леонова',
    since: 'с марта 2025',
    text: 'Уже год каждую пятницу жду свой букет как маленький праздник. Цветы всегда свежие, состав каждый раз разный — никогда не скучно.',
  },
  {
    name: 'Олег Сидоров',
    since: 'с сентября 2024',
    text: 'Подарил жене подписку на год рождения. Теперь дома всегда цветы, и она счастлива. Сервис очень ответственный, ни одной задержки за 8 месяцев.',
  },
  {
    name: 'Светлана Попова',
    since: 'с января 2026',
    text: 'Попробовала тариф "раз в две недели" — идеально! Букеты огромные и стоят долго. Особенно нравится что присылают фото, прежде чем везти.',
  },
]

export function createEmptySubscriptionForm() {
  return {
    name: '',
    phone: '',
    email: '',
    address: '',
    day: 'Пятница',
    time: '18:00-20:00',
    notes: '',
  }
}

export function buildSubscriptionPayload(form: SubscriptionForm, plan: string) {
  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    day: form.day,
    time: form.time,
    notes: form.notes.trim(),
    plan: plan.trim(),
  }
}
