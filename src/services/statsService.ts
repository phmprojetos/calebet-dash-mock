import { api, DEMO_USER_ID } from "@/lib/api";
import { Stats } from "@/lib/mockData";

export interface StatsParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const statsService = {
  // Buscar estatísticas do usuário
  getStats: async (params: StatsParams = {}): Promise<Stats> => {
    const userId = params.userId || DEMO_USER_ID;
    const response = await api.get<Stats>(`/stats/${userId}`);
    return response.data;
  },
};
