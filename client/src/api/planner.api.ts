import api from "./axios";

export interface StudyPlanResponse {
  success: boolean;
  plan: string;
  planType: string;
  cached?: boolean;
}

// ===============================
// Get Study Plan
// ===============================
export const getStudyPlan = async (
  documentId: string,
  planType: "weekly" | "monthly" | "cram_1day" = "weekly"
): Promise<StudyPlanResponse> => {
  const res = await api.get<StudyPlanResponse>(
    `/planner/${documentId}?planType=${planType}`
  );
  return res.data;
};

// ===============================
// Generate Study Plan
// ===============================
export const generateStudyPlan = async (
  documentId: string,
  planType: "weekly" | "monthly" | "cram_1day" = "weekly",
  force: boolean = false
): Promise<StudyPlanResponse> => {
  const res = await api.post<StudyPlanResponse>(
    `/planner/${documentId}`,
    {
      planType,
      force,
    }
  );
  return res.data;
};
