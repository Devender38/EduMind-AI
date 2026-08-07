import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
  user: mongoose.Types.ObjectId;
  document: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      default: "New Conversation",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Faster queries
ConversationSchema.index({
  user: 1,
  updatedAt: -1,
});

export default mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);