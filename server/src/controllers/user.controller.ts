import { Response } from "express";


export const getProfile = (
req:any,
res:Response
)=>{


res.status(200).json({

success:true,

user:req.user

});


};