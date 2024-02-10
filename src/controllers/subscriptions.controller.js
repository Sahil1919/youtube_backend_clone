import mongoose from "mongoose";
import { Subscriptions } from "../schemas/subscriptions.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import asyncHandler from "../utils/asyncHandler.js";


export const toggleSubscription = asyncHandler(async (req, res) => {
    try {

        const { channelId } = req.params
        const subscriberId = req.user._id

        const existingSubscriber = await Subscriptions.findOne({
            subscriber: subscriberId,
            channel: channelId
        })

        if (existingSubscriber) {
            await Subscriptions.deleteOne({ _id: existingSubscriber._id })
            return res.status(200)
                .json(new ApiSuccess({ subscribe: false }, "UnSubscribe Successfully !!!"))
        }
        else {
            await Subscriptions.create({
                subscriber: subscriberId,
                channel: channelId
            })
            return res.status(200)
                .json(new ApiSuccess({ subscribe: true }, "Subscribe Successfully !!!"))

        }
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while toggling Subcriber")
    }

})


export const getUserChannelSubscriber = asyncHandler(async (req, res) => {

    try {
        const { channelId } = req.params

        const subscriber = await Subscriptions.find({ channel: channelId }).populate({
            path: 'subscriber',
            select: 'username email fullName'
        })

        return res.status(200)
            .json(new ApiSuccess(subscriber, "Channel Subscriber Fetched Successfully !!!"))
    } catch (error) {

        throw new ApiError(500, error?.message || 'Something went wrong while getting Channel Subscriber Data !!!')
    }

})

export const getSubscribedChannels = asyncHandler(async (req, res) => {

    try {

        const { subscriberId } = req.params

        const subcscribeTo = await Subscriptions.find({ subscriber: subscriberId }).populate({
            path: 'channel',
            select: 'username fullName email'
        })

        return res.status(200)
            .json(new ApiSuccess(subcscribeTo, "Subscribe To Channel Fetched Successfully !!!"))

    } catch (error) {
        throw new ApiError(500, 'Soemthing went wrong while getting Subscribed Details !!!')
    }
})