import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylistById, getPlaylistById, getUserPlaylists, removeVideoToPlaylist, updatePlaylistById } from "../controllers/playlist.controller.js";


const router = Router()

router.use(verifyJWT)

router.route('/').post(createPlaylist)

router.route("/user/:userId").get(getUserPlaylists);

router.route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylistById)
    .delete(deletePlaylistById)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoToPlaylist)

export default router 