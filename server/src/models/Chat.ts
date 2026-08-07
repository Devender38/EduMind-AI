import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  conversation: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  message: string;
  sources?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    sources: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Faster loading of conversation history
ChatSchema.index({
  conversation: 1,
  createdAt: 1,
});

export default mongoose.model<IChat>(
  "Chat",
  ChatSchema
);