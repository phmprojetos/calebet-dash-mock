import { useQuery } from "@tanstack/react-query";
import { fixturesService, EventsResponse } from "@/services/fixturesService";
import { FixtureSearchResult } from "@/lib/mockData";

export interface UseFixturesSearchOptions {
  query: string;
  limit?: number;
  enabled?: boolean;
}

export interface UseEventsOptions {
  date?: string;
  limit?: number;
  enabled?: boolean;
}

export const useFixturesSearch = (options: UseFixturesSearchOptions) => {
  const { query, limit = 20, enabled = true } = options;

  const searchQuery = useQuery({
    queryKey: ["fixtures", "search", query, limit],
    queryFn: () => fixturesService.searchFixtures({ q: query, limit }),
    enabled: enabled && query.length >= 2,
    staleTime: 30000, // Cache por 30 segundos
    placeholderData: [] as FixtureSearchResult[],
  });

  return {
    fixtures: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    isFetching: searchQuery.isFetching,
    isError: searchQuery.isError,
    error: searchQuery.error,
  };
};

// Hook para obter ligas disponíveis
export const useLeagues = (priorityOnly = true) => {
  const leaguesQuery = useQuery({
    queryKey: ["fixtures", "leagues", priorityOnly],
    queryFn: () => fixturesService.getLeagues(priorityOnly),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  return {
    leagues: leaguesQuery.data || [],
    isLoading: leaguesQuery.isLoading,
    isError: leaguesQuery.isError,
  };
};

// Hook para status da API
export const useApiStatus = () => {
  const statusQuery = useQuery({
    queryKey: ["fixtures", "api-status"],
    queryFn: () => fixturesService.getApiStatus(),
    staleTime: 60000, // Cache por 1 minuto
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  return {
    status: statusQuery.data,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError,
  };
};

// Hook para obter eventos do dia (página /eventos)
export const useEvents = (options: UseEventsOptions = {}) => {
  const { date, limit = 20, enabled = true } = options;

  const eventsQuery = useQuery<EventsResponse>({
    queryKey: ["fixtures", "events", date, limit],
    queryFn: () => fixturesService.getEvents({ date, limit }),
    enabled,
    staleTime: 60000, // Cache por 1 minuto
    refetchInterval: 60000, // Atualiza a cada 1 minuto (para jogos ao vivo)
    placeholderData: { items: [], total: 0, date: date || "" },
  });

  return {
    events: eventsQuery.data?.items || [],
    total: eventsQuery.data?.total || 0,
    date: eventsQuery.data?.date || "",
    isLoading: eventsQuery.isLoading,
    isFetching: eventsQuery.isFetching,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
  };
};

