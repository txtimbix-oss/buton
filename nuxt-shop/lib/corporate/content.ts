export interface CorporateBenefit {
  icon: string
  title: string
  desc: string
}

export interface CorporateFormat {
  title: string
  desc: string
}

export interface CorporateInquiryForm {
  company: string
  inn: string
  volume: string
  frequency: string
  name: string
  phone: string
}

export const corporateBenefits: CorporateBenefit[] = [
  { icon: 'gift', title: 'Постоплата и БДДС', desc: 'Работаем по договору, с закрывающими документами и отсрочкой платежа.' },
  { icon: 'truck', title: 'Регулярные поставки', desc: 'Свежие букеты и растения в офис по графику — еженедельно или к датам.' },
  { icon: 'leaf', title: 'Персональный менеджер', desc: 'Один контакт на все заказы: подарки партнёрам, мероприятия, рецепция.' },
]

export const corporateFormats: CorporateFormat[] = [
  { title: 'Цветы для офиса', desc: 'Подписка на оформление рецепции и переговорных свежими композициями.' },
  { title: 'Подарки партнёрам', desc: 'Брендированные букеты и открытки к праздникам и значимым датам.' },
  { title: 'Мероприятия', desc: 'Флористика для конференций, открытий и корпоративов под ключ.' },
]

export function validateCorporateContact(input: Pick<CorporateInquiryForm, 'name' | 'phone'>) {
  return {
    name: !input.name.trim(),
    phone: !input.phone.trim(),
  }
}

export function buildCorporateInquiryPayload(form: CorporateInquiryForm) {
  return {
    type: 'corporate' as const,
    name: form.name.trim(),
    phone: form.phone.trim(),
    data: {
      company: form.company.trim(),
      inn: form.inn.trim(),
      volume: form.volume.trim(),
      frequency: form.frequency.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
    },
  }
}
