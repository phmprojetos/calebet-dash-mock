import { api, DEMO_USER_ID } from "@/lib/api";

export interface Insight {
  id: number;
  type: "success" | "warning" | "info";
  message: string;
}

export interface InsightsResponse {
  insights: Insight[];
}

export const insightsService = {
  // Buscar insights da IA
  getInsights: async (userId: string = DEMO_USER_ID): Promise<Insight[]> => {
    const response = await api.get<InsightsResponse>(`/insights/${userId}`, {
      timeout: 60000, // 60 segundos para IA processar
    });
    return response.data.insights || [];
  },
};
