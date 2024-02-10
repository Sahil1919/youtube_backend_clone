
import asyncHandler from "../utils/asyncHandler.js";
import { joiLoginrSchema, validateJoiLoginSchema } from "../utils/joiValidation.js";


export const validateLoginUser = asyncHandler(async (req, _, next) => {

    const { value, error } = validateJoiLoginSchema(joiLoginrSchema, req.body)

    if (error) next(error)

    next()
})