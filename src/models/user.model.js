
import userSchema from "../schemas/user.schema.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    try {
        return jwt.sign(
            {
                _id: this._id,
                email: this.email,
                fullName: this.fullName,
                username: this.username
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    } catch (error) {
        console.log('Error while generating Access Token !!!');
        throw error
    }
}

userSchema.methods.generateRefreshToken = function () {
    try {
        return jwt.sign({
            _id: this._id
        },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    } catch (error) {
        console.log("Error while generating Refresh Token !!!");
        throw error
    }
}
const User = mongoose.model('User', userSchema)

export default User