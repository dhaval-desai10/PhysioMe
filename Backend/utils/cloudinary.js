import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: 'physiome',
            resource_type: 'auto'
        });
        return result;
    } catch (error) {
        throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
};

// Add default export
export default cloudinary;