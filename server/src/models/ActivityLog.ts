import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  activityType: "chat" | "summary" | "flashcard" | "quiz" | "notes" | "planner" | "mindmap" | "search";
  title: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      index: true,
    },
    activityType: {
      type: String,
      enum: ["chat", "summary", "flashcard", "quiz", "notes", "planner", "mindmap", "search"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
