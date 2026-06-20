import { describe, expect, it } from 'vitest'

import {
  buildSubscriptionPayload,
  subscriptionPlans,
  subscriptionReviews,
  subscriptionSteps,
  subscriptionWeekDays,
  subscriptionTimeOptions,
  createEmptySubscriptionForm,
} from '~/lib/subscription/content'

describe('subscription content', () => {
  it('keeps the bi-weekly plan marked as popular and preserves the three-step flow', () => {
    expect(subscriptionPlans.find(plan => plan.id === 'monthly-2')?.popular).toBe(true)
    expect(subscriptionSteps).toHaveLength(3)
  })

  it('exposes stable delivery choices and social proof content', () => {
    expect(subscriptionWeekDays).toContain('Пятница')
    expect(subscriptionTimeOptions).toContain('18:00-20:00')
    expect(subscriptionReviews).toHaveLength(3)
  })

  it('builds a stable subscription payload and trims user input', () => {
    const payload = buildSubscriptionPayload({
      name: '  Анна ',
      phone: ' +7 921 111 22 33 ',
      email: ' anna@example.com ',
      address: '  Невский, 1 ',
      day: 'Среда',
      time: '12:00-14:00',
      notes: '  Без лилий  ',
    }, ' 2 букета в месяц ')

    expect(Object.keys(payload)).toEqual([
      'name',
      'phone',
      'email',
      'address',
      'day',
      'time',
      'notes',
      'plan',
    ])

    expect(payload).toMatchObject({
      name: 'Анна',
      phone: '+7 921 111 22 33',
      email: 'anna@example.com',
      address: 'Невский, 1',
      day: 'Среда',
      time: '12:00-14:00',
      notes: 'Без лилий',
      plan: '2 букета в месяц',
    })
  })

  it('keeps empty defaults untouched in empty subscription form factory', () => {
    expect(createEmptySubscriptionForm()).toEqual({
      name: '',
      phone: '',
      email: '',
      address: '',
      day: 'Пятница',
      time: '18:00-20:00',
      notes: '',
    })
  })
})
