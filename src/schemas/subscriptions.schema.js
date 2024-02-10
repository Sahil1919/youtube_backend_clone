import mongoose, { Schema } from "mongoose";

const subScriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},  
    {
        timestamps: true
    }
)

export const Subscriptions = mongoose.model("Subscription", subScriptionSchema)