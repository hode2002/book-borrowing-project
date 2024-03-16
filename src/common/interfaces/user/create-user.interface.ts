export interface CreateUser {
    lastName: string
    firstName: string
    dob?: Date
    address: {
        Address: string
        province: string
        district: string
        ward: string
        hamlet: string
    }
    phoneNumber: string
    gender?: string
}
