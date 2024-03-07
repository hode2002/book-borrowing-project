import app from './src/app'
import configMongodb from './src/configs/config.mongodb'

const {
    app: { port: PORT },
} = configMongodb

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})
