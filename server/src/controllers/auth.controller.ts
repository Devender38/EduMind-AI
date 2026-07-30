import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User";
import RefreshToken from "../models/RefreshToken";

import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/generateToken";



// ===============================
// REGISTER USER
// ===============================

export const register = async (
    req: Request,
    res: Response
) => {

    try {


        const {
            name,
            email,
            password
        } = req.body;



        const existingUser =
            await User.findOne({
                email
            });



        if(existingUser){

            return res.status(400).json({

                success:false,

                message:"User already exists"

            });

        }



        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );



        const user =
            await User.create({

                name,

                email,

                password:hashedPassword

            });



        res.status(201).json({

            success:true,

            message:"User registered successfully",

            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }

        });



    } catch(error:any){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};





// ===============================
// LOGIN USER
// ===============================

export const login = async (
    req:Request,
    res:Response
)=>{


try{


const {
    email,
    password
}=req.body;



const user =
await User.findOne({
    email
});



if(!user){

return res.status(404).json({

success:false,

message:"User not found"

});

}



const isMatch =
await bcrypt.compare(
    password,
    user.password
);



if(!isMatch){

return res.status(401).json({

success:false,

message:"Invalid password"

});

}




// Generate Tokens

const accessToken =
generateAccessToken(
    user._id.toString()
);



const refreshToken =
generateRefreshToken(
    user._id.toString()
);





// Save Refresh Token

await RefreshToken.create({

    user:user._id,

    token:refreshToken,

    expiresAt:
    new Date(
        Date.now()
        +
        7*24*60*60*1000
    )

});





// Store Refresh Token Cookie

res.cookie(

    "refreshToken",

    refreshToken,

    {

        httpOnly:true,

        secure:false,

        sameSite:"lax",

        maxAge:
        7*24*60*60*1000

    }

);





res.status(200).json({

success:true,

message:"Login successful",

accessToken,

user:{

id:user._id,

name:user.name,

email:user.email,

role:user.role

}

});



}
catch(error:any){


res.status(500).json({

success:false,

message:error.message

});


}


};





// ===============================
// REFRESH TOKEN
// ===============================


export const refreshToken = async (

req:Request,

res:Response

)=>{


try{


const token =
req.cookies.refreshToken;



if(!token){

return res.status(401).json({

success:false,

message:"Refresh token missing"

});

}




const storedToken =
await RefreshToken.findOne({

token

});



if(!storedToken){

return res.status(403).json({

success:false,

message:"Invalid refresh token"

});

}





jwt.verify(

token,

process.env.JWT_REFRESH_SECRET as string

);





const newAccessToken =
generateAccessToken(

storedToken.user.toString()

);



res.json({

success:true,

accessToken:newAccessToken

});



}
catch(error){


res.status(403).json({

success:false,

message:"Refresh token expired"

});


}


};







// ===============================
// LOGOUT USER
// ===============================


export const logout = async (

req:Request,

res:Response

)=>{


try{


const token =
req.cookies.refreshToken;



if(token){


await RefreshToken.deleteOne({

token

});


}




res.clearCookie(
    "refreshToken"
);



res.json({

success:true,

message:"Logout successful"

});



}
catch(error:any){


res.status(500).json({

success:false,

message:error.message

});


}



};