import api from "./axios";

export interface ActivityHistoryItem {
  _id: string;
  userId: string;
  documentId?: {
    _id: string;
    title: string;
    fileUrl?: string;
  };
  activityType: "chat" | "summary" | "flashcard" | "quiz" | "notes" | "planner" | "mindmap" | "search";
  title: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AnalyticsTelemetry {
  documentsCount: number;
  quizzesCount: number;
  notesCount: number;
  questionsAsked: number;
  learningStreak: number;
  recentActivities: ActivityHistoryItem[];
}

export const getActivityHistory = async (
  activityType?: string,
  limit: number = 50
): Promise<ActivityHistoryItem[]> => {
  const res = await api.get("/history", {
    params: { activityType, limit },
  });
  return res.data.history;
};

export const logActivity = async (data: {
  documentId?: string;
  activityType: string;
  title: string;
  metadata?: Record<string, any>;
}): Promise<ActivityHistoryItem> => {
  const res = await api.post("/history/log", data);
  return res.data.log;
};

export const getAnalyticsTelemetry = async (): Promise<AnalyticsTelemetry> => {
  const res = await api.get("/history/telemetry");
  return res.data.telemetry;
};
