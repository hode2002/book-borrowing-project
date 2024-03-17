import { Address } from './address.interface'

export interface CreateEmployee {
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    address: Address
}
