import mongoose, { Document, Schema } from "mongoose";


// Document Interface

export interface IDocument extends Document {

    user: mongoose.Types.ObjectId;

    title: string;

    fileName: string;

    fileUrl: string;

    cloudinaryPublicId: string;

    fileSize: number;

    fileType: string;

    extractedText?: string;

    status:
        | "uploaded"
        | "processing"
        | "completed"
        | "failed";

    createdAt: Date;

    updatedAt: Date;

}





// MongoDB Schema

const DocumentSchema = new Schema<IDocument>(

    {


        user: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            index:true

        },



        title: {

            type:String,

            required:true,

            trim:true

        },



        fileName: {

            type:String,

            required:true

        },



        fileUrl: {

            type:String,

            required:true

        },



        cloudinaryPublicId: {

            type:String,

            required:true

        },



        fileSize: {

            type:Number,

            required:true

        },



        fileType: {

            type:String,

            default:"application/pdf"

        },



        extractedText: {

            type:String,

            default:""

        },



        status: {

            type:String,

            enum:[

                "uploaded",

                "processing",

                "completed",

                "failed"

            ],

            default:"uploaded"

        }



    },


    {

        timestamps:true

    }

);




// Export Model

export default mongoose.model<IDocument>(

    "Document",

    DocumentSchema

);