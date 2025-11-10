import { useQuery } from "@tanstack/react-query";
import { formatStatsDateParam, statsService, StatsParams } from "@/services/statsService";
import { DEMO_USER_ID } from "@/lib/api";

export const useStats = (params: StatsParams = {}) => {
  return useQuery({
    queryKey: [
      "stats",
      params.userId || DEMO_USER_ID,
      formatStatsDateParam(params.startDate),
      formatStatsDateParam(params.endDate),
    ],
    queryFn: () => statsService.getStats(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
