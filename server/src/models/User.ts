import mongoose, { Schema } from "mongoose";


const UserSchema = new Schema(

{
    name:{
        type:String,
        required:true
    },


    email:{
        type:String,
        required:true,
        unique:true
    },


    password:{
        type:String,
        required:true
    },


    role:{
        type:String,
        enum:[
            "student",
            "admin"
        ],
        default:"student"
    },


    avatar:{
        type:String,
        default:""
    }

},

{
    timestamps:true
}

);


const User = mongoose.model(
    "User",
    UserSchema
);


export default User;