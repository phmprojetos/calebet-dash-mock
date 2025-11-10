import { useQuery } from "@tanstack/react-query";
import { statsService, StatsParams } from "@/services/statsService";
import { DEMO_USER_ID } from "@/lib/api";

export const useStats = (params: StatsParams = {}) => {
  return useQuery({
    queryKey: [
      "stats",
      params.userId || DEMO_USER_ID,
      params.startDate ? params.startDate.toISOString() : undefined,
      params.endDate ? params.endDate.toISOString() : undefined,
    ],
    queryFn: () => statsService.getStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
