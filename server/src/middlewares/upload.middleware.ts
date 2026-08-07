import multer from "multer";
import { Request } from "express";

// Store file in memory for Cloudinary uploads
const storage = multer.memoryStorage();

// PDF File Filter
const pdfFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

// Image File Filter (JPEG, PNG, WEBP, GIF, SVG)
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, WEBP, GIF) are allowed"));
  }
};

// Multer Configuration for PDF documents (10 MB Max)
const upload = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Multer Configuration for Avatar images (5 MB Max)
export const uploadAvatarMiddleware = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;