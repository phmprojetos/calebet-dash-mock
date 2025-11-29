import { useQuery } from "@tanstack/react-query";
import { formatStatsDateParam, statsService, StatsParams } from "@/services/statsService";
import { useAuth } from "@/contexts/AuthContext";
import { Stats } from "@/lib/mockData";

// Stats vazias para mostrar imediatamente enquanto carrega
const emptyStats: Stats = {
  total_bets: 0,
  total_stake: 0,
  total_profit: 0,
  avg_odd: 0,
  win_rate: 0,
  roi: 0,
  monthly_performance: [],
  by_result: { win: 0, loss: 0, pending: 0, void: 0, cashout: 0 },
  by_market: {},
  best_market: "",
  worst_market: "",
  positive_cashouts: 0,
  positive_cashouts_profit: 0,
};

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
    // Mostra stats vazias imediatamente enquanto busca da API
    placeholderData: emptyStats,
    // Retry rápido para 404 (sem apostas)
    retry: (failureCount, error) => {
      // Não retry em 404 (significa que não há dados)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) return false;
      }
      return failureCount < 2;
    },
  });
};
