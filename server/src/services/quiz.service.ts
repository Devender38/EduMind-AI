import axios from "axios";

interface GenerateQuizOptions {
  document: any;
  difficulty: string;
  count: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const AI_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8000";

// ======================================
// Generate Quiz Using AI Service
// ======================================

export const generateQuiz = async ({
  document,
  difficulty,
  count,
}: GenerateQuizOptions): Promise<QuizQuestion[]> => {
  try {
    const response = await axios.post(
      `${AI_URL}/quiz`,
      {
        documentId: document._id,
        difficulty,
        count,
      },
      {
        timeout: 120000,
      }
    );

    if (
      !response.data ||
      !Array.isArray(response.data.questions)
    ) {
      throw new Error(
        "Invalid quiz response from AI Service."
      );
    }

    return response.data.questions;
  } catch (error: any) {
    console.error(
      "Quiz Service Error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to generate quiz."
    );
  }
};