import api from "./axios";

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: string[];
}

export const askAI = async (question: string): Promise<ChatResponse> => {
  const token = localStorage.getItem("token");

  const res = await api.post(
    "/chat",
    { question },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};