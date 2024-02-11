import { Video } from "../schemas/videos.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadCloudinary, { deleteCloudinary } from "../utils/cloudinary.js";


export const getAllVideo = asyncHandler(async (req, res) => {
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

    const videoList = await Video.find(baseQuery).sort(sort).skip((page - 1) * limit).limit(limit)

    const totalCount = videoList.length

    return res.status(200)
        .json(new ApiSuccess({ videoList, page, totalCount }))


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

export const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    const video = await Video.findById({ _id: videoId }).populate({
        path: 'owner',
        select: 'username fullName email'
    })

    if (!video) throw new ApiError(400, "Video Not found !!!")

    return res.status(200)
        .json(new ApiSuccess(video, 'Video fetched Successfully !!!'))
})

export const updateVideo = asyncHandler(async (req, res) => {
    let { videoId } = req.params
    const loginUser = req.user._id

    const video = await Video.findById({ _id: videoId }).populate({
        path: 'owner',
        select: 'username fullName email'
    })

    if (!video) throw new ApiError(400, "Video Not found !!!")

    if (loginUser.toString() !== video.owner.toString()) throw new ApiError(401, "Unauthorized Request!!!")

    const { title, description } = req.body

    if (title) video.title = title
    if (description) video.description = description

    const thumbnailLocalPath = req.file?.path

    if (thumbnailLocalPath) {
        const isPreviousDelete = await deleteCloudinary(video.thumbnail, 'image')
        if (isPreviousDelete) {

            const thumbnail = await uploadCloudinary(thumbnailLocalPath)
            video.thumbnail = thumbnail.url
        }
    }

    await video.save({ validateBeforeSave: false })

    const updateVideo = await Video.findById(video._id)

    return res.status(200)
        .json(new ApiSuccess(updateVideo, "Video Details Updated Successfully !!!"))

})

export const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const loginUser = req.user._id

    const video = await Video.findById(videoId)

    if (!video) throw new ApiError(400, "Video Not found !!!")

    if (loginUser.toString() !== video.owner.toString()) throw new ApiError(401, "Unauthorized Request !!!")

    const isPreviousVideoDeleted = await deleteCloudinary(video.videoFile, 'video')
    const isPreviousThumbnailDeleted = await deleteCloudinary(video.thumbnail, 'image')

    if (!(isPreviousThumbnailDeleted, isPreviousVideoDeleted)) {
        throw new ApiError(500, "Something went wrong while Deleting Video !!!")
    }

    await video.deleteOne({ _id: video._id })
    return res.status(200)
        .json(new ApiSuccess({ isVideoDeleted: true }, 'Video is Successfully Deleted !!!'))

})

export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const loginUser = req.user._id

    const video = await Video.findById(videoId)

    if (!video) throw new ApiError(400, "Video Not found !!!")

    if (loginUser.toString() !== video.owner.toString()) throw new ApiError(401, "Unauthorized Request !!!")

    video.isPublished = !video.isPublished

    video.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiSuccess({ isPublished: video.isPublished }, "Toggle Publish Status Successfully !!!"))
})