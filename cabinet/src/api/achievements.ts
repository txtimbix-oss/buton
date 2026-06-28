import { http, unwrap } from './client'

export interface ApiAchievement {
  key: string
  name: string
  description: string
  imageUrl?: string
  imageAlt?: string
  metric?: string
  current?: number
  target?: number
  progressPct?: number
  missing?: number
  status?: string
  earned: boolean
  rewardType?: string
  rewardValue?: number
  rewardDescription?: string
}

export interface AchievementsResponse {
  summary?: { earned: number; total: number; nearComplete: number }
  earnedKeys: string[]
  items: ApiAchievement[]
}

export const achievementsApi = {
  // GET /api/user/achievements (cookie auth)
  get: () => unwrap(http.get<AchievementsResponse>('/achievements')),
}
