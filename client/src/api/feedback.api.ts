import api from "./axios";

export interface FeedbackItem {
  _id: string;
  user: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  category: string;
  message: string;
  quickTags?: string[];
  createdAt: string;
}

export interface SubmitFeedbackPayload {
  rating: number;
  category: string;
  message: string;
  quickTags?: string[];
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback: FeedbackItem;
}

export interface FeedbacksListResponse {
  success: boolean;
  count: number;
  feedbacks: FeedbackItem[];
}

/**
 * Submit website review/feedback
 */
export const submitFeedback = async (
  payload: SubmitFeedbackPayload
): Promise<FeedbackResponse> => {
  const res = await api.post<FeedbackResponse>("/feedback", payload);
  return res.data;
};

/**
 * Get recent public reviews/feedbacks
 */
export const getRecentFeedbacks = async (): Promise<FeedbackItem[]> => {
  const res = await api.get<FeedbacksListResponse>("/feedback");
  return res.data.feedbacks || [];
};
