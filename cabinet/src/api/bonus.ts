import { http, unwrap } from './client'
import type { BonusResponse } from '@/types/api'

export const bonusApi = {
  getBonus: () =>
    unwrap(http.get<BonusResponse>('/bonus')),
}
