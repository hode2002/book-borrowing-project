import type { Address } from './address.interface'

export interface UserProfile {
  _id?: string
  email: string
  lastName: string
  firstName: string
  dob: Date | null
  address: Address
  gender: string
  phoneNumber: string
  avatar: string
}
