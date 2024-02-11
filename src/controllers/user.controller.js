
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiSuccess from '../utils/ApiSuccess.js'
import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { options } from '../constant.js'

import uploadCloudinary from '../utils/cloudinary.js'


async function generateAccessAndRefreshToken(id) {
    try {
        const user = await User.findById(id)

        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token !!!")
    }
}

export const registerUser = asyncHandler(async (req, res) => {


    const { username, email, fullName, password } = req.body

    const existedUser = await User.findOne({
        $or: [{ username, email }]
    })

    if (existedUser) throw new ApiError(409, "User is Already Exist !!!")

    const avatarLocalPath = req.files?.avatar[0]?.path

    if (!avatarLocalPath) throw new ApiError(400, 'Avatar image is Required !!!')

    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    const coverImage = await uploadCloudinary(coverImageLocalPath)

    if (!avatar) throw new ApiError(400, 'Avatar image is Required !!!')

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ''
    })

    const createdUser = await User.findById(user._id).select('-password -refreshToken')

    if (!createdUser) throw new ApiError(500, "Something Went Wrong while Creating a User !!!")

    return res.status(200)
        .json(new ApiSuccess(createdUser, 'User is Created Successfully !!!'))

})

export const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body

    const user = await User.findOne({
        $or: [{ username, email }]
    })

    if (!user) throw new ApiError(404, "User is not Exist !!!")

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(401, 'Invalid Credentials')

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiSuccess(loggedInUser, 'User Login Successfully'))
})

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )

    return res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiSuccess("User Logout Successfully !!! "))
})

export const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) throw new ApiError(401, 'Invalid RefreshToken !!!')

    const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodeToken._id)

    if (!user) throw new ApiError(401, 'Unauthorized User !!!')

    if (incomingRefreshToken !== user.refreshToken) throw new ApiError(401, "Refresh Token is Expired or use !!!")

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(new ApiSuccess({ accessToken, refreshToken }, "Access Token is Refreshed !!!"))
})

export const changePassword = asyncHandler(asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) throw new ApiError(400, "Invalid Previous Password !!!")

    user.password = newPassword

    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiSuccess('Password is changed Successfully !!!'))

}))

export const currentUser = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(new ApiSuccess(req.user, "Current User Sent Successfully !!!"))
})

export const updateProfileDetails = asyncHandler(async (req, res) => {

    const { fullName, email } = req.body

    if (!(fullName || email)) throw new ApiError(400, 'All fields are required !!!')

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {

            $set: { fullName, email }
        },
        {
            new: true
        }
    ).select('-password -refreshToken')

    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiSuccess(user, 'Details Update Successfully !!!'))
})

export const getUserChannelProfile = asyncHandler(async (req, res) => {

    try {
        const username = req.params.username

        if (!username) throw new ApiError(401, 'Username is Missing !!!')

        const channel = await User.aggregate([
            {
                $match: { username: username.toLowerCase() }
            },
            {
                $lookup: {
                    from: 'subscriptions',
                    foreignField: 'channel',
                    localField: '_id',
                    as: 'subscriber'
                }
            },
            {
                $lookup: {
                    from: 'subscriptions',
                    foreignField: 'subscriber',
                    localField: '_id',
                    as: 'subscriberTo'
                }
            },
            {
                $addFields: {
                    subscriberCount: {
                        $size: '$subscriber'
                    },
                    subscriberToCount: {
                        $size: '$subscriberTo'
                    },
                }
            },
            {
                $project: {
                    fullName: 1, email: 1, username: 1, avatar: 1, coverImage: 1, subscriberCount: 1, subscriberToCount: 1
                }
            }
        ])

        if (!channel.length) throw new ApiError(404, "Channel doesn't exist !!!")

        return res.status(200)
            .json(
                new ApiSuccess(200, channel, "User Channel data fetched successfully !!!")
            )

    } catch (error) {
        throw new ApiError(500, error?.message || 'Something went wrong while getting Channel details !!!')
    }
})

export const getUserWatchHistory = asyncHandler(async (req, res) => {
    try {
        // const watchHistory = await User.findById(req.user._id).populate('watchHistory')
        const watchHistory = await User.aggregate([
            {
                $match: { _id: req.user._id }
            },
            {
                $addFields: {
                    watchHistory: { $cond: { if: { $isArray: "$watchHistory" }, then: "$watchHistory", else: [] } }
                }
            },
            {
                $lookup: {
                    from: 'videos',
                    let: { watchHistory: '$watchHistory' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$watchHistory'] }
                            }
                        }
                    ],
                    as: 'watchHistory'
                }
            },
            {
                $project: {
                    username: 1,
                    fullName: 1,
                    email: 1,
                    watchHistory: 1
                }
            }
        ]);
        
        

        if (!watchHistory || watchHistory.length === 0) {
            throw new ApiError(404, "Watch History doesn't exist !!!");
        }

        return res.status(200).json(
            new ApiSuccess(200, watchHistory, "User Watch history fetched successfully !!!")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while getting the watch history data");
    }
});
