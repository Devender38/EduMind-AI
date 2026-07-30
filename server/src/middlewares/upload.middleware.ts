import multer from "multer";

import { Request } from "express";



// Store file in memory
// Cloudinary upload ke liye use karenge

const storage = multer.memoryStorage();





// File Filter

const fileFilter = (

    req: Request,

    file: Express.Multer.File,

    cb: multer.FileFilterCallback

) => {


    if(file.mimetype === "application/pdf") {


        cb(null,true);


    } else {


        cb(
            new Error("Only PDF files are allowed")
        );


    }


};






// Multer Configuration

const upload = multer({

    storage,


    fileFilter,


    limits: {

        fileSize: 10 * 1024 * 1024
        // 10 MB Maximum

    }


});




export default upload;