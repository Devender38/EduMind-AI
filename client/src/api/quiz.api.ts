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