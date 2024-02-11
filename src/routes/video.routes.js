import { Router } from "express";
import { uploadFile } from "../middlewares/multer.middleware.js";
import { getAllVideo, publishAVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route('/').get(getAllVideo).post(
    uploadFile.fields([
        {
            name: 'videoFile',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]),
    publishAVideo
)


export default router