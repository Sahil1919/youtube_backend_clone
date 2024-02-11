import { Router } from "express";
import { uploadFile } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route('/')
    .get(getAllVideo)
    .post(
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

router.route('/:videoId')
    .get(getVideoById)
    .patch(uploadFile.single("thumbnail"), updateVideo)
    .delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router