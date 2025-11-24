import { useQuery } from "@tanstack/react-query";
import { formatStatsDateParam, statsService, StatsParams } from "@/services/statsService";
import { useAuth } from "@/contexts/AuthContext";

export const useStats = (params: StatsParams = {}) => {
  const { user } = useAuth();
  const userId = user?.id || "";
  
  return useQuery({
    queryKey: [
      "stats",
      userId,
      formatStatsDateParam(params.startDate),
      formatStatsDateParam(params.endDate),
    ],
    queryFn: () => statsService.getStats({ ...params, userId }),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};
