export type ProfileGender = '' | 'male' | 'female' | 'other'

export type ProfileForm = {
  firstName: string
  lastName: string
  phone: string
  email: string
  birthDate: string
  gender: ProfileGender
}

export type ProfileNotifications = {
  orderStatus: boolean
  news: boolean
}
