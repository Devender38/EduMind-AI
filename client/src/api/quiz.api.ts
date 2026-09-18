import api from "./axios";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: string;
  chapter?: string;
}

export interface QuizResponse {
  success: boolean;
  count?: number;
  quiz: QuizQuestion[];
}

export const getQuiz = async (
  documentId: string
): Promise<QuizResponse> => {
  const response = await api.get<QuizResponse>(
    `/quiz/${documentId}`
  );
  return response.data;
};

export const regenerateQuiz = async (
  documentId: string
): Promise<QuizResponse> => {
  const response = await api.post<QuizResponse>(
    `/quiz/${documentId}/regenerate`
  );
  return response.data;
};

export interface SubmitQuizPayload {
  score: number;
  totalQuestions: number;
  answers?: Record<number, string>;
  questions?: QuizQuestion[];
}

export const submitQuiz = async (
  documentId: string,
  payload: SubmitQuizPayload
): Promise<any> => {
  const response = await api.post(
    `/quiz/${documentId}/submit`,
    payload
  );
  return response.data;
};