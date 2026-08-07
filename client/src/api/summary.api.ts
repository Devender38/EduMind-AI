import api from "./axios";

export interface SummaryResponse {
  success: boolean;
  summary: string;
  keywords: string[];
  reading_time: number;
  page_count: number;
  chunk_count: number;
}

export const getSummary = async (
  documentId: string
): Promise<SummaryResponse> => {
  const response = await api.get<SummaryResponse>(
    `/summary/${documentId}`
  );
  return response.data;
};

export const regenerateSummary = async (
  documentId: string
): Promise<SummaryResponse> => {
  const response = await api.post<SummaryResponse>(
    `/summary/${documentId}/regenerate`
  );
  return response.data;
};