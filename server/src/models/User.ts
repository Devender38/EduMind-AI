import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface ILoginHistory {
  ip: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  device?: string;
  loginAt: Date;
  status: "success" | "failed" | "locked";
}

export interface IUser extends Document {
  name: string;
  username?: string;
  email: string;
  password: string;
  role: "student" | "admin" | "premium" | "guest";
  avatar: string;
  avatarPublicId?: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  loginHistory: ILoginHistory[];
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  generateResetPasswordToken(): string;
  generateEmailVerificationToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    role: {
      type: String,
      enum: ["student", "admin", "premium", "guest"],
      default: "student",
    },

    avatar: {
      type: String,
      default: "",
    },

    avatarPublicId: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },

    phone: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },

    timezone: {
      type: String,
      default: "UTC",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpire: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },

    lastLogin: {
      type: Date,
    },

    loginHistory: [
      {
        ip: { type: String, default: "127.0.0.1" },
        userAgent: { type: String, default: "" },
        browser: { type: String, default: "Unknown" },
        os: { type: String, default: "Unknown" },
        device: { type: String, default: "Desktop" },
        loginAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["success", "failed", "locked"],
          default: "success",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Account lockout helper method
UserSchema.methods.isLocked = function (): boolean {
  return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

// Password comparison method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate crypto secure Reset Password Token (15 min expiry)
UserSchema.methods.generateResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Expire in 15 minutes
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

  return resetToken;
};

// Generate Email Verification Token (24 hr expiry)
UserSchema.methods.generateEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Expire in 24 hours
  this.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return verificationToken;
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;