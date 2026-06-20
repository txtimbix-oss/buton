export interface SubscriptionStep {
  n: string
  title: string
  text: string
}

export interface SubscriptionPlan {
  id: string
  title: string
  price: number
  period: string
  popular: boolean
  features: string[]
}

export interface SubscriptionReview {
  name: string
  since: string
  text: string
}

export interface SubscriptionForm {
  name: string
  phone: string
  email: string
  address: string
  day: string
  time: string
  notes: string
}
