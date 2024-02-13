
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
import videoRouter from './routes/video.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import commentRouter from './routes/comment.routes.js'
import tweetRouter from './routes/tweet.routes.js'

app.use('/api/v1/users', userRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/playlists', playlistRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/tweets', tweetRouter)


export default app 