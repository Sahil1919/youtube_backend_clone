// user.route.js
import { Router } from "express";
import { uploadFile } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerUser, loginUser, logoutUser,refreshAccessToken,
        changePassword, currentUser, updateProfileDetails,
        getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controller.js";
import { validateRegisterUser, validateLoginUser } from "../middlewares/validateRegisterUser.middleware.js";

const router = Router();


router.route("/register").post(
    uploadFile.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    validateRegisterUser,
    registerUser
)

router.route('/login').post(validateLoginUser,loginUser)

router.route('/logout').post(verifyJWT,logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/change-password').post(verifyJWT,changePassword)

router.route('/current-user').get(verifyJWT,currentUser)

router.route('/update-account').patch(verifyJWT,updateProfileDetails)

router.route('/c/:username').get(verifyJWT,getUserChannelProfile)

router.route('/watchhistory').get(verifyJWT,getUserWatchHistory)

export default router;
