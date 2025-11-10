import { useQuery } from "@tanstack/react-query";
import { insightsService } from "@/services/insightsService";
import { DEMO_USER_ID } from "@/lib/api";

export const useInsights = (userId: string = DEMO_USER_ID) => {
  return useQuery({
    queryKey: ["insights", userId],
    queryFn: () => insightsService.getInsights(userId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
