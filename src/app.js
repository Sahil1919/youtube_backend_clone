
import express from "express"
import cors from "cors"
import { RESPONSE_LIMIT } from "./constant.js"
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors(
    { origin: process.env.CORS_ORIGIN, }
))

app.use(express.json({ limit: RESPONSE_LIMIT }))
app.use(express.urlencoded({ extended: true, limit: RESPONSE_LIMIT }))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from "./routes/user.routes.js"
import subscriptionRouter from './routes/subscriptions.routes.js'

app.use('/api/v1/users', userRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)


export default app 