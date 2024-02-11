import { Video } from "../schemas/videos.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadCloudinary from "../utils/cloudinary.js";


export const getAllVideo = asyncHandler(async (req, res) => {
    let { page = 1, limit = 2, query, sortBy, sortType, userId } = req.query

    page = Number(page)
    limit = Number(limit)

    const baseQuery = {}

    if (query) {
        const regExp = new RegExp(query, 'i')
        baseQuery.$or = [
            { title: regExp },
            { description: regExp }
        ]
    }

    if (userId) baseQuery.owner = userId

    let sort = {};
        switch (sortBy) {
            case 'uploadDate':
                sort.createdAt = sortType === 'desc' ? -1 : 1;
                break;
            case 'viewCount':
                sort.views = sortType === 'desc' ? -1 : 1;
                break;

            default:
                // You can define your own relevance algorithm or fallback to a default sorting
                // Here, we'll sort by createdAt as a default option
                sort.createdAt = sortType === 'desc' ? -1 : 1;
                break;
        }

    const videoList = await Video.find(baseQuery).sort(sort).skip( (page-1)* limit).limit(limit)

    const totalCount = videoList.length

    return res.status(200)
        .json( new ApiSuccess({videoList,page,totalCount}))


})


export const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const userId = req.user._id
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    const video = await uploadCloudinary(videoLocalPath)
    const thumbnail = await uploadCloudinary(thumbnailLocalPath)
    const duration = video.duration
    const views = 0
    const isPublished = true

    if (!(video, thumbnail)) throw new ApiError(400, "Video and thumbnail is required !!!")

    const uploadVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        owner: userId,
        title,
        description,
        duration,
        views,
        isPublished
    })

    const isUploadVideo = await Video.findById(uploadVideo._id)

    if (!isUploadVideo) throw new ApiError(500, 'Something went wrong while uploading the video !!!')

    return res.status(200)
        .json(new ApiSuccess(isUploadVideo, 'Video is Uploaded Successfully !!!'))

})