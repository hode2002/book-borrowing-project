import dotenv from 'dotenv'
dotenv.config()

interface config {
    app: {
        port: number
    }
    db: {
        uri: string
    }
}

const config: config = {
    app: {
        port: Number(process.env.PORT) || 3000,
    },
    db: {
        uri:
            process.env.MONGODB_URI ||
            'mongodb://127.0.0.1:27017/CT449-Project',
    },
}

export default config
