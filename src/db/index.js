
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {

        const connectionState = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MONGODB Connected !!! DB Host : ${connectionState.connection.host}`);

    } catch (error) {
        console.error("MONGO DB Connection Error", error)
        process.exit(1)
    }
}

export default connectDB