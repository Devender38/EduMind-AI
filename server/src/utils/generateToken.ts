import jwt from "jsonwebtoken";



// Generate Access Token

export const generateAccessToken = (
    userId: string
): string => {


    const token = jwt.sign(

        {
            id: userId
        },

        process.env.JWT_SECRET as string,

        {
            expiresIn: "15m" as jwt.SignOptions["expiresIn"]
        }

    );


    return token;

};





// Generate Refresh Token

export const generateRefreshToken = (
    userId: string
): string => {


    const token = jwt.sign(

        {
            id: userId
        },

        process.env.JWT_REFRESH_SECRET as string,

        {
            expiresIn: "7d" as jwt.SignOptions["expiresIn"]
        }

    );


    return token;

};