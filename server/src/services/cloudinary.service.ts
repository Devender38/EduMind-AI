import cloudinary from "../config/cloudinary";
import { createLogger } from "../utils/logger";

const logger = createLogger("CloudinaryService");

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

export const uploadPDF = (
  fileBuffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> => {
  const startTime = Date.now();
  logger.info(`Starting Cloudinary upload for '${fileName}' (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "edumind/documents",
        public_id: fileName.replace(".pdf", ""),
        overwrite: true,
      },
      (error, result) => {
        const elapsed = Date.now() - startTime;
        if (error) {
          logger.error(`Cloudinary upload failed for '${fileName}' after ${elapsed}ms:`, error);
          return reject(error);
        }

        if (!result) {
          const err = new Error("Cloudinary upload returned empty result");
          logger.error(err.message);
          return reject(err);
        }

        logger.info(
          `Cloudinary upload succeeded for '${fileName}' in ${elapsed}ms | URL: ${result.secure_url}`
        );

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const uploadImage = (
  fileBuffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> => {
  const startTime = Date.now();
  logger.info(`Starting Cloudinary image upload for '${fileName}' (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "edumind/avatars",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
        overwrite: true,
      },
      (error, result) => {
        const elapsed = Date.now() - startTime;
        if (error) {
          logger.error(`Cloudinary image upload failed for '${fileName}' after ${elapsed}ms:`, error);
          return reject(error);
        }

        if (!result) {
          const err = new Error("Cloudinary image upload returned empty result");
          logger.error(err.message);
          return reject(err);
        }

        logger.info(
          `Cloudinary image upload succeeded for '${fileName}' in ${elapsed}ms | URL: ${result.secure_url}`
        );

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteImage = async (publicId: string): Promise<boolean> => {
  if (!publicId) return false;
  try {
    logger.info(`Deleting Cloudinary image: ${publicId}`);
    const res = await cloudinary.uploader.destroy(publicId);
    logger.info(`Cloudinary image deletion result: ${JSON.stringify(res)}`);
    return res.result === "ok";
  } catch (error: any) {
    logger.error(`Failed to delete Cloudinary image '${publicId}': ${error.message}`, error);
    return false;
  }
};