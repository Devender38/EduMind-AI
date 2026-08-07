import api from "./axios";

export interface RecentActivityItem {
  _id: string;
  question: string;
  title: string;
  createdAt: string;
}

export interface DashboardStats {
  totalDocuments: number;
  totalQuestions: number;
  totalResponses: number;
  storageUsed: string;
  quizzesTaken: number;
  averageScore: number;
  recentActivity: RecentActivityItem[];
}

interface DashboardResponse {
  success: boolean;
  totalDocuments?: number;
  totalQuestions?: number;
  totalResponses?: number;
  storageUsed?: string;
  quizzesTaken?: number;
  averageScore?: number;
  recentActivity?: RecentActivityItem[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get<DashboardResponse>("/dashboard/stats");

  return {
    totalDocuments: res.data.totalDocuments ?? 0,
    totalQuestions: res.data.totalQuestions ?? 0,
    totalResponses: res.data.totalResponses ?? 0,
    storageUsed: res.data.storageUsed ?? "0 MB",
    quizzesTaken: res.data.quizzesTaken ?? 0,
    averageScore: res.data.averageScore ?? 0,
    recentActivity: res.data.recentActivity ?? [],
  };
};