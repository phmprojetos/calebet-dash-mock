import { useQuery } from "@tanstack/react-query";
import { insightsService } from "@/services/insightsService";
import { useAuth } from "@/contexts/AuthContext";

export const useInsights = () => {
  const { user } = useAuth();
  const userId = user?.id || "";
  
  return useQuery({
    queryKey: ["insights", userId],
    queryFn: () => insightsService.getInsights(userId),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};
