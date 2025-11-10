import { api, DEMO_USER_ID, requestWithFallback, unwrapApiResponse } from "@/lib/api";
import { mockInsights } from "@/lib/mockData";

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
    const response = await requestWithFallback([
      () =>
        api
          .get(`/insights/${userId}`, { timeout: 60000 })
          .then((res) => res.data),
      () =>
        api
          .get(`/users/${userId}/insights`, { timeout: 60000 })
          .then((res) => res.data),
      () => Promise.resolve({ insights: mockInsights }),
    ]);

    const payload = unwrapApiResponse<InsightsResponse | Insight[]>(response);

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.insights)) {
      return payload.insights;
    }

    return [];
  },
};
