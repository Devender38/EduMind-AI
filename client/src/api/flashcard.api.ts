import api from "./axios";

export interface Flashcard {
  question: string;
  answer: string;
}

export interface FlashcardResponse {
  success: boolean;
  count?: number;
  flashcards: Flashcard[];
}

export const getFlashcards = async (
  documentId: string
): Promise<FlashcardResponse> => {
  const response = await api.get<FlashcardResponse>(
    `/flashcards/${documentId}`
  );
  return response.data;
};

export const regenerateFlashcards = async (
  documentId: string
): Promise<FlashcardResponse> => {
  const response = await api.post<FlashcardResponse>(
    `/flashcards/${documentId}/regenerate`
  );
  return response.data;
};