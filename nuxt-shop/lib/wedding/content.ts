export interface WeddingGalleryItem {
  kind: string
  h: number
}

export interface WeddingPackage {
  title: string
  price: string
  desc: string
  popular: boolean
}

export interface WeddingInquiryForm {
  name: string
  phone: string
  date: string
  format: string
  budget: string
}

export interface WeddingPageContent {
  breadcrumbCurrent: string
  heroEyebrow: string
  heroTitleLines: [string, string]
  heroLead: string
  heroCtaLabel: string
  portfolioEyebrow: string
  portfolioTitle: string
  portfolioLinkLabel: string
  packagesEyebrow: string
  packagesTitle: string
  popularPackageCtaLabel: string
  packageCtaLabel: string
  consultationEyebrow: string
  consultationTitle: string
  consultationLead: string
  successTitle: string
  successText: string
  submitLabel: string
  submitPendingLabel: string
  fields: {
    name: string
    phone: string
    date: string
    format: string
    budget: string
  }
  placeholders: {
    name: string
    phone: string
    format: string
    budget: string
  }
}

export const weddingGallery: WeddingGalleryItem[] = [
  { kind: 'cream', h: 320 },
  { kind: 'rose', h: 240 },
  { kind: 'green', h: 260 },
  { kind: 'peach', h: 300 },
  { kind: 'lav', h: 250 },
  { kind: 'mix', h: 290 },
]

export const weddingPackages: WeddingPackage[] = [
  { title: 'Камерная', price: 'от 35 000', desc: 'Букет невесты, бутоньерка, 2 композиции на столы.', popular: false },
  { title: 'Классическая', price: 'от 90 000', desc: 'Арка, президиум, букет, бутоньерки, оформление зала.', popular: true },
  { title: 'Полная', price: 'от 180 000', desc: 'Полное оформление под ключ: церемония, банкет, фотозона.', popular: false },
]

export const weddingPageContent: WeddingPageContent = {
  breadcrumbCurrent: 'Свадьбы',
  heroEyebrow: 'Свадебная флористика',
  heroTitleLines: ['Цветы для самого', 'важного дня'],
  heroLead: 'От букета невесты до оформления зала. Разработаем флористическую концепцию вашей свадьбы и реализуем её до последнего лепестка.',
  heroCtaLabel: 'Записаться на консультацию',
  portfolioEyebrow: 'Портфолио',
  portfolioTitle: 'Наши работы',
  portfolioLinkLabel: 'Смотреть все',
  packagesEyebrow: 'Пакеты оформления',
  packagesTitle: 'Выберите формат',
  popularPackageCtaLabel: 'Самый востребованный',
  packageCtaLabel: 'Обсудить формат',
  consultationEyebrow: 'Консультация',
  consultationTitle: 'Расскажите о вашем дне',
  consultationLead: 'Оставьте детали — флорист-декоратор свяжется, чтобы обсудить концепцию и смету. Это бесплатно и ни к чему не обязывает.',
  successTitle: 'Заявка принята!',
  successText: 'Свяжемся с вами в течение рабочего дня для обсуждения вашей свадьбы.',
  submitLabel: 'Записаться на консультацию',
  submitPendingLabel: 'Отправляем…',
  fields: {
    name: 'Имя *',
    phone: 'Телефон *',
    date: 'Дата события',
    format: 'Формат',
    budget: 'Примерный бюджет',
  },
  placeholders: {
    name: 'Анна',
    phone: '+7 921 ···',
    format: 'Выездная церемония',
    budget: '90 000 — 150 000 ₽',
  },
}

export function createEmptyWeddingInquiryForm(): WeddingInquiryForm {
  return {
    name: '',
    phone: '',
    date: '',
    format: '',
    budget: '',
  }
}

export function validateWeddingContact(input: Pick<WeddingInquiryForm, 'name' | 'phone'>) {
  return {
    name: !input.name.trim(),
    phone: !input.phone.trim(),
  }
}

export function buildWeddingInquiryPayload(form: WeddingInquiryForm) {
  return {
    type: 'wedding' as const,
    name: form.name.trim(),
    phone: form.phone.trim(),
    data: {
      name: form.name.trim(),
      phone: form.phone.trim(),
      date: form.date.trim(),
      format: form.format.trim(),
      budget: form.budget.trim(),
    },
  }
}
