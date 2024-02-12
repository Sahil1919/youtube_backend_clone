

import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiSuccess from "../utils/ApiSuccess.js"
import { Comment } from "../schemas/comment.schema.js"

export const addComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const userId = req.user._id
    const { content } = req.body

    let comment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    if (!comment) throw new ApiError(500, "Something went wrong while commenting !!!")

    comment = await Comment.findById(comment._id)
        .populate('video')
        .populate({
            path: "owner",
            select: 'username email fullName'
        })

    return res.status(200)
        .json(new ApiSuccess(comment, "Comment Added Successfully !!!"))
})

export const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    let { page = 1, limit = 2 } = req.query

    page = Number(page)
    limit = Number(limit)

    const commentList = await Comment.find({ video: videoId })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('video')
        .populate({
            path: "owner",
            select: 'username email fullName'
        })

    if (!commentList) throw new ApiError(401, "Invalid Video ID !!!")

    const totalComment = commentList.length

    res.status(200)
        .json(new ApiSuccess({ commentList, page, totalComment }, "Video Comments Fetched Successfully !!!"))

})

export const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    const loginUser = req.user._id

    const comment = await Comment.findById(commentId)
        .populate('video')
        .populate({
            path: "owner",
            select: 'username email fullName'
        })

    if (!comment) throw new ApiError(401, "Invalid Comment ID !!!")

    if (loginUser.toString() !== comment.owner._id.toString()) throw new ApiError(401, "Unauthorized Request!!!")

    comment.content = content

    await comment.save({ validateBeforeSave: false })

    res.status(200)
        .json(new ApiSuccess(comment, "Comment is Updated Successfully !!!"))

})

export const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params
    const loginUser = req.user._id

    const comment = await Comment.findById(commentId)

    if (!comment) throw new ApiError(401, "Invalid Comment ID !!!")

    if (loginUser.toString() !== comment.owner._id.toString()) throw new ApiError(401, "Unauthorized Request!!!")

    await comment.deleteOne({ _id: comment._id })

    res.status(200)
        .json(new ApiSuccess({ isCommentDelete: true }, "Comment is Deleted Successfully !!!"))

})