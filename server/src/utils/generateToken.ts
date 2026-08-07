import jwt, { Secret, SignOptions } from "jsonwebtoken";

// ===============================
// Generate Access Token (15 Minutes)
// ===============================
export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "edumind_jwt_secret_dev_key_2026";

  return jwt.sign(
    {
      id: userId,
      type: "access",
    },
    secret as Secret,
    {
      expiresIn: "15m",
    } as SignOptions
  );
};

// ===============================
// Generate Refresh Token (7 Days or 30 Days if Remember Me)
// ===============================
export const generateRefreshToken = (
  userId: string,
  rememberMe: boolean = false
): string => {
  const secret =
    process.env.JWT_REFRESH_SECRET || "edumind_jwt_refresh_dev_key_2026";

  return jwt.sign(
    {
      id: userId,
      type: "refresh",
    },
    secret as Secret,
    {
      expiresIn: rememberMe ? "30d" : "7d",
    } as SignOptions
  );
};