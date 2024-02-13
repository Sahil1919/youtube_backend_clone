import mongoose from "mongoose"
import { Video } from "../schemas/videos.schema.js"
import { Subscriptions } from "../schemas/subscriptions.schema.js"
import { Like } from "../schemas/likes.schema.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiSuccess from "../utils/ApiSuccess.js"
import ApiError from "../utils/ApiError.js"
import { json } from "express"

export const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { userId } = req.params

    let totalVideoViews = await Video.aggregate([
        { $group: { _id: "owner", totalViews: { $sum: "$views" } } }
    ])

    totalVideoViews = totalVideoViews[0].totalViews

    const totalSubscriber = await Subscriptions.countDocuments({ channel: userId })

    const totalVideo = await Video.countDocuments({ owner: userId })

    let totalLikes = await Like.aggregate([
        { $group: { _id: "$video", totalLikes: { $sum: 1 } } }
    ])

    totalLikes = totalLikes.map(model => model.totalLikes).reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    return res.status(200).json(new ApiSuccess(
        {
            totalVideoViews,
            totalSubscriber,
            totalVideo,
            totalLikes
        }
    ));
})

export const getChannelVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 2, query, sortBy, sortType, userId } = req.query

    page = Number(page)
    limit = Number(limit)

    const baseQuery = { isPublished: true }

    if (query) {
        const regExp = new RegExp(query, 'i')
        baseQuery.$or = [
            { title: regExp },
            { description: regExp }
        ]
    }

    if (userId) baseQuery.owner = userId

    const allowedSortOptions = ['uploadDate', 'views'];

    if (sortBy && !allowedSortOptions.includes(sortBy)) {
        throw new ApiError(403, `Invalid sortBy parameter. Allowed values are: ${allowedSortOptions.join(', ')}`);
    }

    let sort = {};
    switch (sortBy) {
        case allowedSortOptions[0]:
            sort.createdAt = sortType === 'desc' ? -1 : 1;
            break;
        case allowedSortOptions[1]:
            sort.views = sortType === 'desc' ? -1 : 1;
            break;

        default:
            // You can define your own relevance algorithm or fallback to a default sorting
            // Here, we'll sort by createdAt as a default option
            sort.createdAt = sortType === 'desc' ? -1 : 1;
            break;
    }

    const videoList = await Video.find(baseQuery)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
            path: 'owner',
            select: 'username fullName email'
        })

    const totalCount = videoList.length

    return res.status(200)
        .json(new ApiSuccess({ videoList, page, totalCount }))


})