import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  category: string; // "General", "AI Quality", "Voice Speech", "Feature Request", "Bug Report"
  message: string;
  quickTags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    category: {
      type: String,
      enum: [
        "General Review",
        "AI Answers & Speed",
        "Cute Voice Tutor",
        "Feature Request",
        "Bug / Issue",
      ],
      default: "General Review",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    quickTags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFeedback>("Feedback", FeedbackSchema);
