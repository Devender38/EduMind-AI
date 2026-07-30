import cloudinary from "../config/cloudinary";

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

export const uploadPDF = (
  fileBuffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "edumind/documents",
        public_id: fileName.replace(".pdf", ""),
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload failed"));
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};