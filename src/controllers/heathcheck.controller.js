import ApiError from "../utils/ApiError.js"
import ApiSuccess from "../utils/ApiSuccess.js"
import asyncHandler from "../utils/asyncHandler.js"


export const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {

        return res.status(200)
            .json(new ApiSuccess({}, 'OK'))
    } catch (error) {
        return res.status(200)
            .json(new ApiError(504, 'Failed !!!'))
    }
})


