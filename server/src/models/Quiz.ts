import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
}

export interface IQuiz extends Document {
  user: mongoose.Types.ObjectId;
  document: mongoose.Types.ObjectId;

  title: string;

  difficulty: "easy" | "medium" | "hard";

  questions: IQuizQuestion[];

  score: number;

  totalQuestions: number;

  completed: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuizQuestion>(
  {
    question: {
      type: String,
      required: true,
    },

    options: [
      {
        type: String,
        required: true,
      },
    ],

    correctAnswer: {
      type: String,
      required: true,
    },

    explanation: {
      type: String,
      default: "",
    },

    userAnswer: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const QuizSchema = new Schema<IQuiz>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: [
        "easy",
        "medium",
        "hard",
      ],
      default: "medium",
    },

    questions: [QuestionSchema],

    score: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IQuiz>(
  "Quiz",
  QuizSchema
);