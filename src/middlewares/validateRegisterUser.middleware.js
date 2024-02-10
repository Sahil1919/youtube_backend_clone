
import asyncHandler from "../utils/asyncHandler.js";
import { joiRegisterSchema,validateJoiRegisterSchema,validateJoiLoginSchema, joiLoginrSchema } from "../utils/joiValidation.js";

export const validateRegisterUser = asyncHandler ( async (req, _, next) => {

    const {value,error} = validateJoiRegisterSchema(joiRegisterSchema,req.body)

    if (error) next(error)
    next()
})

export const validateLoginUser = asyncHandler ( async (req, _, next) => {

    const {value,error} = validateJoiLoginSchema(joiLoginrSchema,req.body)

    if (error) next(error)
    next()
})