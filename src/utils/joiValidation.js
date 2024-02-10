
import Joi from 'joi'

export const joiRegisterSchema = Joi.object({
    fullName: Joi.string().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9@]{3,30}$")),
    confirmPassword: Joi.ref("password")
})

export const validateJoiRegisterSchema = (schema,dataToValidate) =>{
    
    const {value,error} = schema.validate(dataToValidate,{abortEarly: false})
    
    return {value,error} 
}

export const joiLoginrSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9@]{3,30}$")),
})

export const validateJoiLoginSchema = (schema,dataToValidate) =>{
    
    const {value,error} = schema.validate(dataToValidate,{abortEarly: false})
    
    return {value,error} 
}