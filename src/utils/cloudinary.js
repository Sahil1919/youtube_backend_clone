
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
        console.log("File Uploaded in Cloudinary Successfully !!!");
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("Something went wrong while uploading file in Cloudinary !!!");
        fs.unlinkSync(localFilePath)
    }
}

export const deleteCloudinary = async (resourceName, resourceType) => {
    try {

        if (!resourceName) return null

        const publicId = resourceName.split('/').pop().split('.')[0]
        const response = await cloudinary.api.delete_resources([publicId], {
            resource_type: resourceType
        })

        console.log(`resourceName - ${resourceName} & type - ${resourceType} delete !!!`);
        return response

    } catch (error) {
        console.log("Something went wrong while deleting file in Cloudinary !!!");
        return null
    }
}

export default uploadCloudinary