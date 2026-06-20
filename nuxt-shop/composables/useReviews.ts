import { usePersistentState } from '~/lib/storage/persistentState'

interface LocalReview {
  id: number
  name: string
  date: string
  rating: number
  text: string
  photo: string | null
  isUser?: boolean
}

export function useReviews(slug: string) {
  const key = `spb_reviews_${slug}`
  const userReviews = usePersistentState<LocalReview[]>(`reviews:${slug}`, key, () => [])

  function addReview(r: { name: string; rating: number; text: string }) {
    const rev: LocalReview = {
      id: Date.now(),
      name: r.name,
      rating: r.rating,
      text: r.text,
      photo: null,
      isUser: true,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
    userReviews.value = [rev, ...userReviews.value]
    return rev
  }

  return { userReviews, addReview }
}
