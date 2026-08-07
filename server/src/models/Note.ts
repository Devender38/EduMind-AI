import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  title: string;
  noteType: "detailed" | "exam" | "revision" | "one_page" | "bullet";
  content: string;
  tags: string[];
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
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
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Study Notes",
    },
    noteType: {
      type: String,
      enum: ["detailed", "exam", "revision", "one_page", "bullet"],
      default: "detailed",
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INote>("Note", NoteSchema);
