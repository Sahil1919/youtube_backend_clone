
import { Playlist } from "../schemas/playlist.schema.js";
import ApiError from "../utils/ApiError.js";
import ApiSuccess from "../utils/ApiSuccess.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description } = req.body
    const userId = req.user._id

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    if (!playlist) throw new ApiError(500, 'Something went wrong while creating Playlist !!!')

    return res.status(200)
        .json(new ApiSuccess(playlist, "Playlist created Successfully !!!"))
})

export const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const playlist = await Playlist.find({ owner: userId })
        .populate({
            path: 'owner',
            select: 'username fullName email'
        })
        .populate({
            path: 'videos'
        })

    if (!playlist) throw new ApiError(400, "Invalid User ID !!!")

    return res.status(200)
        .json(new ApiSuccess(playlist, "Playlist Fetched using UserID Successfully !!!"))

})

export const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const playlist = await Playlist.findById(playlistId).populate({
        path: 'owner',
        select: 'username fullName email'
    })

    if (!playlist) throw new ApiError(400, "Invalid Playlist ID !!!")

    return res.status(200)
        .json(new ApiSuccess(playlist, "Playlist Fetched using playlistID Successfully !!!"))
})

export const updatePlaylistById = asyncHandler(async (req, res) => {

    const { playlistId } = req.params
    const { name, description } = req.body
    const loginUser = req.user._id

    const playlist = await Playlist.findById(playlistId).populate({
        path: 'owner',
        select: 'username fullName email'
    })
    if (!playlist) throw new ApiError(400, "Invalid Playlist ID !!!")

    if (loginUser.toString() !== playlist.owner._id.toString()) throw new ApiError(401, "Unauthorized Request!!!")

    if (name) playlist.name = name
    if (description) playlist.description = description

    playlist.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiSuccess(playlist, "Playlist Details Updated Successfully !!!"))
})

export const deletePlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const loginUser = req.user._id

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) throw new ApiError(400, "Invalid Playlist ID !!!")

    if (loginUser.toString() !== playlist.owner._id.toString()) throw new ApiError(401, "Unauthorized Request !!!")

    await playlist.deleteOne({ _id: playlist._id })
    return res.status(200)
        .json(new ApiSuccess({ isPlaylistDeleted: true }, 'Playlist is Successfully Deleted !!!'))

})

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const loginUser = req.user._id

    const playlist = await Playlist.findById(playlistId).populate({
        path: 'owner',
        select: 'username fullName email'
    })

    if (!playlist) throw new ApiError(400, "Invalid Playlist ID !!!")

    if (loginUser.toString() !== playlist.owner._id.toString()) throw new ApiError(401, "Unauthorized Request !!!")

    playlist.videos.push(videoId)

    await playlist.save({ validateBeforeSave: false })

    const updatePlaylist = await playlist.populate('videos')

    return res.status(200)
        .json(new ApiSuccess(updatePlaylist, 'Video is Added in Playlist Successfully !!!'))

})

export const removeVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const loginUser = req.user._id

    const playlist = await Playlist.findById(playlistId).populate({
        path: 'owner',
        select: 'username fullName email'
    })

    if (!playlist) throw new ApiError(400, "Invalid Playlist ID !!!")

    if (loginUser.toString() !== playlist.owner._id.toString()) throw new ApiError(401, "Unauthorized Request !!!")

    if (!playlist.videos.includes(videoId)) throw new ApiError(400, "Video is not Exist in Playlist !!!")

    playlist.videos = playlist.videos.filter(video => video._id.toString() !== videoId)

    await playlist.save({ validateBeforeSave: false })

    const updatePlaylist = await playlist.populate('videos')

    return res.status(200)
        .json(new ApiSuccess(updatePlaylist, 'Video is Added in Playlist Successfully !!!'))

})

