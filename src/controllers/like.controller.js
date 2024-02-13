import { Like } from "../schemas/likes.schema.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js";
import ApiSuccess from "../utils/ApiSuccess.js";


export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const loginUser = req.user._id;

    // Check if the user has already liked the video
    const existingLike = await Like.findOne({ video: videoId });

    if (existingLike) {

        if (loginUser.toString() !== existingLike.likedBy.toString()) throw new ApiError(401, "Unauthorized Request !!!")

        await Like.findOneAndDelete({ likedBy: loginUser._id });

        return res.status(200).json(new ApiSuccess({ isLikeRemove: true }, "Like removed successfully !!!"));
    } else {
        // User has not liked the video, so add the like
        const newLike = await Like.create({ video: videoId, likedBy: loginUser })
        await newLike.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiSuccess(newLike, "Like added successfully !!!"));
    }
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const loginUser = req.user._id;


    const existingComment = await Like.findOne({ comment: commentId });

    if (existingComment) {

        await Like.findOneAndDelete({ comment: commentId });

        return res.status(200).json(new ApiSuccess({ isCommentLikeRemove: true }, "Comment Like removed successfully !!!"));
    } else {

        const newLikeComment = await Like.create({ comment: commentId, likedBy: loginUser })

        await newLikeComment.save({ validateBeforeSave: false });
        return res.status(200).json(new ApiSuccess(newLikeComment, "Comment Like added successfully !!!"));
    }
});

export const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const loginUser = req.user._id;


    const existingTweet = await Like.findOne({ tweet: tweetId });

    if (existingTweet) {

        await Like.findOneAndDelete({ tweet: tweetId });

        return res.status(200).json(new ApiSuccess({ isCommentLikeRemove: true }, "Comment Like removed successfully !!!"));
    } else {

        const newLikeTweet = await Like.create({ tweet: tweetId, likedBy: loginUser })

        await newLikeTweet.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiSuccess(newLikeTweet, "Comment Like added successfully !!!"));
    }
});

export const getLikedVideos = asyncHandler(async (req, res) => {

    const loginUser = req.user._id

    const likeVideos = await Like.find({ likedBy: loginUser })
        .populate('video')
        .populate('likedBy')

    return res.status(200).json(new ApiSuccess(likeVideos, "Like added successfully !!!"));

})