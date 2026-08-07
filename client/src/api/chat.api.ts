import api from "./axios";

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: string[];
}

export interface AskAIRequest {
  question: string;
  conversationId?: string;
  documentId?: string;
}

export const askAI = async ({
  question,
  conversationId,
  documentId,
}: AskAIRequest): Promise<ChatResponse> => {
  const response = await api.post(
    "/chat",
    {
      question,
      conversationId,
      documentId,
    },
    {
      timeout: 180000,
    }
  );

  return response.data;
};

export const askQuestion = async (
  question: string,
  documentId?: string
): Promise<ChatResponse> => {
  return askAI({ question, documentId });
};