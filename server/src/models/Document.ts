import mongoose, { Document, Schema } from "mongoose";

// ==============================
// Flashcard Interface
// ==============================

export interface IFlashcard {
  question: string;
  answer: string;
}

// ==============================
// Quiz Interface
// ==============================

export interface IQuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

// ==============================
// Document Interface
// ==============================

export interface IDocument extends Document {
  user: mongoose.Types.ObjectId;

  title: string;

  fileName: string;

  fileUrl: string;

  cloudinaryPublicId: string;

  fileSize: number;

  fileType: string;

  extractedText: string;

  status:
    | "uploaded"
    | "processing"
    | "completed"
    | "failed";

  // AI Fields

  summary: string;

  keywords: string[];

  flashcards: IFlashcard[];

  quiz: IQuizQuestion[];

  notes: string;

  studyPlan?: {
    weekly?: string;
    monthly?: string;
    cram_1day?: string;
  };

  pageCount: number;

  chunkCount: number;

  readingTime: number;

  createdAt: Date;

  updatedAt: Date;
}

// ==============================
// Flashcard Schema
// ==============================

const FlashcardSchema =
  new Schema<IFlashcard>(
    {
      question: {
        type: String,
        required: true,
      },

      answer: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

// ==============================
// Quiz Schema
// ==============================

const QuizSchema =
  new Schema<IQuizQuestion>(
    {
      question: {
        type: String,
        required: true,
      },

      options: [
        {
          type: String,
        },
      ],

      answer: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

// ==============================
// Main Schema
// ==============================

const DocumentSchema =
  new Schema<IDocument>(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      fileName: {
        type: String,
        required: true,
      },

      fileUrl: {
        type: String,
        required: true,
      },

      cloudinaryPublicId: {
        type: String,
        required: true,
      },

      fileSize: {
        type: Number,
        required: true,
      },

      fileType: {
        type: String,
        default: "application/pdf",
      },

      extractedText: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "uploaded",
          "processing",
          "completed",
          "failed",
        ],
        default: "uploaded",
      },

      // =====================
      // AI Fields
      // =====================

      summary: {
        type: String,
        default: "",
      },

      keywords: {
        type: [String],
        default: [],
      },

      flashcards: {
        type: [FlashcardSchema],
        default: [],
      },

      quiz: {
        type: [QuizSchema],
        default: [],
      },

      notes: {
        type: String,
        default: "",
      },

      studyPlan: {
        weekly: { type: String, default: "" },
        monthly: { type: String, default: "" },
        cram_1day: { type: String, default: "" },
      },

      pageCount: {
        type: Number,
        default: 0,
      },

      chunkCount: {
        type: Number,
        default: 0,
      },

      readingTime: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IDocument>(
  "Document",
  DocumentSchema
);