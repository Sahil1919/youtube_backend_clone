

import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiSuccess from "../utils/ApiSuccess.js"
import { Tweet } from "../schemas/tweet.schema.js"

export const createTweet = asyncHandler(async (req, res) => {

    const userId = req.user._id
    const { content } = req.body

    let tweet = await Tweet.create({
        content,
        owner: userId
    })

    if (!tweet) throw new ApiError(500, "Something went wrong while tweeting !!!")

    tweet = await Tweet.findById(tweet._id)
        .populate({
            path: "owner",
            select: 'username email fullName'
        })

    return res.status(200)
        .json(new ApiSuccess(tweet, "Tweet Added Successfully !!!"))
})

export const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params
    let { page = 1, limit = 2 } = req.query

    page = Number(page)
    limit = Number(limit)

    const tweetList = await Tweet.find({ owner: userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
            path: "owner",
            select: 'username email fullName'
        })

    if (!tweetList) throw new ApiError(401, "Invalid User ID !!!")

    const totaltweet = tweetList.length

    res.status(200)
        .json(new ApiSuccess({ tweetList, page, totaltweet }, "User Tweets Fetched Successfully !!!"))

})

export const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    const loginUser = req.user._id

    const tweet = await Tweet.findById(tweetId)
        .populate({
            path: "owner",
            select: 'username email fullName'
        })

    if (!tweet) throw new ApiError(401, "Invalid Tweet ID !!!")

    if (loginUser.toString() !== tweet.owner._id.toString()) throw new ApiError(401, "Unauthorized Request!!!")

    tweet.content = content

    await tweet.save({ validateBeforeSave: false })

    res.status(200)
        .json(new ApiSuccess(tweet, "Tweet is Updated Successfully !!!"))

})

export const deletTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params
    const loginUser = req.user._id

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) throw new ApiError(401, "Invalid Tweet ID !!!")

    if (loginUser.toString() !== tweet.owner._id.toString()) throw new ApiError(401, "Unauthorized Request!!!")

    await tweet.deleteOne({ _id: tweet._id })

    res.status(200)
        .json(new ApiSuccess({ istweetDelete: true }, "Tweet is Deleted Successfully !!!"))

})