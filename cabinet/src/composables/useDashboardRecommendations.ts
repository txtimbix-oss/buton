import { ref } from 'vue'
import { api } from '@/api'
import type { IProduct } from '@/types/product'

export function useDashboardRecommendations() {
  const recommendations = ref<IProduct[]>([])

  async function loadRecommendations(wishlist: string[] = []) {
    try {
      const products = await api.getProducts({ featured: 'true' })
      recommendations.value = products.filter(product => !wishlist.includes(product.slug)).slice(0, 4)
    } catch {}
  }

  return {
    loadRecommendations,
    recommendations,
  }
}
