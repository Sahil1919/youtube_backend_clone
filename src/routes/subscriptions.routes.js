

import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscriber, toggleSubscription } from "../controllers/subscriptions.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route('/c/:channelId').post(toggleSubscription).get(getUserChannelSubscriber)

router.route('/u/:subscriberId').get(getSubscribedChannels)


export default router
