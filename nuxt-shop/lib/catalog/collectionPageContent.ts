import type { CatalogCollectionReason } from '~/lib/catalog/types'

const DEFAULT_COLLECTION_INTRO = 'В этой подборке собраны авторские букеты из свежих сезонных цветов, собранные с акцентом на аккуратную упаковку и спокойную подачу.'

export function buildCollectionIntro(input: { description?: string | null }) {
  return input.description || DEFAULT_COLLECTION_INTRO
}

export function getBouquetWord(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return 'букет'
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'букета'
  return 'букетов'
}

export function buildCollectionCopy(input: {
  productCount: number
  bouquetWord: string
  storeCity?: string | null
  tag?: string | null
}) {
  const city = input.storeCity || 'Санкт-Петербурге'

  if (input.tag) {
    return `Эта коллекция собрана по тегу «${input.tag}» и содержит ${input.productCount} ${input.bouquetWord} для оформления подарка в ${city}. Подборка хороша для гибких сценариев: романтичных, официальных и уютных моментов, если нужна сборка не длиннее пары часов.`
  }

  return `Подборка содержит ${input.productCount} ${input.bouquetWord}, которые удобно дарить в разных ситуациях. Букеты формируются для быстрого согласования и готовы для заказа сразу после выбора.`
}

export function getCollectionOccasionHint(collectionName: string) {
  const title = collectionName.toLowerCase()

  if (title.includes('свад')) return 'на свадьбу и помолвку'
  if (title.includes('празд')) return 'на праздники'
  if (title.includes('мини')) return 'на небольшой компактный подарок'
  return 'на разные поводы'
}

export function buildCollectionReasons(input: {
  collectionName: string
  productCount: number
}): CatalogCollectionReason[] {
  return [
    {
      title: 'Подход под случай',
      text: `Коллекция собрана с фокусом на ${getCollectionOccasionHint(input.collectionName)}, чтобы подарок выглядел цельно и уместно.`,
    },
    {
      title: 'Быстрая доставка',
      text: 'Весь ассортимент из этой коллекции поддерживает доставку в удобный день и время с фото букета перед отправкой.',
    },
    {
      title: 'Гибкий выбор',
      text: `Уже ${input.productCount} вариантов позволяют подобрать размер и бюджет, а также добавить открытку, ленту или сладкий акцент на этапе заказа.`,
    },
  ]
}
