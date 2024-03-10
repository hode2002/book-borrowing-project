class ApiError extends Error {
    readonly status: number
    readonly message: string

    constructor(status: number, message: string) {
        super()
        this.status = status
        this.message = message
    }
}

export default ApiError
