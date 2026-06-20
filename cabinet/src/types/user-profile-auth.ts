import type { IAddress } from './user-address'
import type { INotificationPrefs } from './user-notifications'

export interface IUser {
  _id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  birthDate?: string
  gender?: 'male' | 'female' | 'other'
  notifications: INotificationPrefs
  addresses: IAddress[]
  wishlist: string[]
  bonusBalance: number
  totalSpent: number
  referralCode: string
  achievements: string[]
  createdAt: string
}

export interface AuthResponse {
  ok: boolean
  user: IUser
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  referralCode?: string
}

export type UpdateProfilePayload = Partial<
  Pick<IUser, 'email' | 'firstName' | 'lastName' | 'phone' | 'avatar' | 'birthDate' | 'gender' | 'notifications'>
>

export interface UploadAvatarResponse {
  urls: string[]
}
