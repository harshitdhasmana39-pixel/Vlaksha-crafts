import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.CLOUDINARY_URL) {
  console.warn("⚠️ CLOUDINARY_URL environment variable is missing.");
}

export const uploadImage = (buffer: Buffer, folder: string, publicId?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      fetch_format: 'auto',
      quality: 'auto',
      resource_type: 'image',
    };
    
    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.invalidate = true;
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error(`[Cloudinary Upload Error] folder: ${folder}`, error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    return result;
  } catch (error) {
    console.error(`[Cloudinary Delete Error] public_id: ${publicId}`, error);
    throw error;
  }
};
