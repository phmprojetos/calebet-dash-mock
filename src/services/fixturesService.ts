import { api, requestWithFallback } from "@/lib/api";
import { FixtureSearchResult, League, ApiStatus } from "@/lib/mockData";

// Dados mock para fallback
const mockFixtures: FixtureSearchResult[] = [
  {
    id: 1035243,
    event_name: "Flamengo vs Palmeiras",
    home_team_name: "Flamengo",
    away_team_name: "Palmeiras",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
  {
    id: 1035244,
    event_name: "Corinthians vs São Paulo",
    home_team_name: "Corinthians",
    away_team_name: "São Paulo",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
  {
    id: 1035245,
    event_name: "Santos vs Grêmio",
    home_team_name: "Santos",
    away_team_name: "Grêmio",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
  {
    id: 1035246,
    event_name: "Internacional vs Botafogo",
    home_team_name: "Internacional",
    away_team_name: "Botafogo",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
  {
    id: 1035247,
    event_name: "Fluminense vs Atlético-MG",
    home_team_name: "Fluminense",
    away_team_name: "Atlético-MG",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
  {
    id: 1035248,
    event_name: "Athletico-PR vs Cruzeiro",
    home_team_name: "Athletico-PR",
    away_team_name: "Cruzeiro",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
  {
    id: 1035249,
    event_name: "Bahia vs Fortaleza",
    home_team_name: "Bahia",
    away_team_name: "Fortaleza",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
  {
    id: 1035250,
    event_name: "Vasco vs Ceará",
    home_team_name: "Vasco",
    away_team_name: "Ceará",
    home_team_logo: null,
    away_team_logo: null,
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    league_id: 71,
  },
];

const mockLeagues: League[] = [
  {
    id: 71,
    name: "Brasileirão Série A",
    country: "Brazil",
    country_code: "BR",
    logo: null,
    type: "league",
    season: 2024,
  },
  {
    id: 72,
    name: "Brasileirão Série B",
    country: "Brazil",
    country_code: "BR",
    logo: null,
    type: "league",
    season: 2024,
  },
  {
    id: 73,
    name: "Copa do Brasil",
    country: "Brazil",
    country_code: "BR",
    logo: null,
    type: "cup",
    season: 2024,
  },
];

const parseFixtureSearchResults = (data: unknown): FixtureSearchResult[] => {
  console.log("[fixturesService] Raw response:", data);

  // Se a resposta está dentro de um wrapper
  let items = data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const container = data as Record<string, unknown>;
    // Verificar wrappers comuns
    for (const key of ["data", "items", "results", "fixtures"]) {
      if (key in container && Array.isArray(container[key])) {
        items = container[key];
        break;
      }
    }
  }

  if (Array.isArray(items)) {
    const parsed = items.map((item) => ({
      id: typeof item.id === "number" ? item.id : (typeof item.fixture_id === "number" ? item.fixture_id : 0),
      event_name: typeof item.event_name === "string" ? item.event_name : "",
      home_team_name: typeof item.home_team_name === "string" ? item.home_team_name : "",
      away_team_name: typeof item.away_team_name === "string" ? item.away_team_name : "",
      home_team_logo: typeof item.home_team_logo === "string" ? item.home_team_logo : null,
      away_team_logo: typeof item.away_team_logo === "string" ? item.away_team_logo : null,
      date: typeof item.date === "string" ? item.date : new Date().toISOString(),
      league_id: typeof item.league_id === "number" ? item.league_id : 0,
    }));
    console.log("[fixturesService] Parsed fixtures:", parsed);
    return parsed;
  }

  console.log("[fixturesService] No fixtures found in response");
  return [];
};

const parseLeagues = (data: unknown): League[] => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      id: typeof item.id === "number" ? item.id : 0,
      name: typeof item.name === "string" ? item.name : "",
      country: typeof item.country === "string" ? item.country : "",
      country_code: typeof item.country_code === "string" ? item.country_code : "",
      logo: typeof item.logo === "string" ? item.logo : null,
      type: typeof item.type === "string" ? item.type : "league",
      season: typeof item.season === "number" ? item.season : new Date().getFullYear(),
    }));
  }
  return [];
};

const parseApiStatus = (data: unknown): ApiStatus => {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    return {
      remaining_requests: typeof d.remaining_requests === "number" ? d.remaining_requests : 0,
      max_requests_per_day: typeof d.max_requests_per_day === "number" ? d.max_requests_per_day : 100,
      usage_percent: typeof d.usage_percent === "number" ? d.usage_percent : 0,
    };
  }
  return {
    remaining_requests: 0,
    max_requests_per_day: 100,
    usage_percent: 0,
  };
};

export interface SearchFixturesParams {
  q: string;
  limit?: number;
}

export interface GetEventsParams {
  date?: string; // YYYY-MM-DD
  limit?: number;
}

export interface EventItem {
  id: string;
  fixture_id: number;
  date: string;
  time: string;
  league: string;
  league_country: string;
  league_logo: string | null;
  home_team: string;
  away_team: string;
  home_team_short: string;
  away_team_short: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  home_odd: number | null;
  draw_odd: number | null;
  away_odd: number | null;
  is_live: boolean;
}

export interface EventsResponse {
  items: EventItem[];
  total: number;
  date: string;
}

export const fixturesService = {
  // Buscar partidas por termo (autocomplete)
  searchFixtures: async (params: SearchFixturesParams): Promise<FixtureSearchResult[]> => {
    const { q, limit = 20 } = params;

    // Validação mínima de 2 caracteres
    if (!q || q.length < 2) {
      return [];
    }

    console.log("[fixturesService] Searching fixtures with query:", q);

    try {
      const response = await api.get("/fixtures/search", { params: { q, limit } });
      console.log("[fixturesService] API Response status:", response.status);
      console.log("[fixturesService] API Response data:", response.data);
      const parsed = parseFixtureSearchResults(response.data);
      
      if (parsed.length > 0) {
        return parsed;
      }
      
      // Se a API retornou vazio, usar fallback de mock
      console.log("[fixturesService] API returned empty, using mock fallback");
    } catch (error) {
      console.log("[fixturesService] API Error, using mock fallback:", error);
    }

    // Fallback para dados mock filtrados
    const normalizedQuery = q.toLowerCase();
    const filtered = mockFixtures.filter(
      (f) =>
        f.event_name.toLowerCase().includes(normalizedQuery) ||
        f.home_team_name.toLowerCase().includes(normalizedQuery) ||
        f.away_team_name.toLowerCase().includes(normalizedQuery)
    );
    console.log("[fixturesService] Mock fallback results:", filtered.length);
    return filtered.slice(0, limit);
  },

  // Listar ligas disponíveis
  getLeagues: async (priorityOnly = true): Promise<League[]> => {
    return requestWithFallback<League[]>([
      () =>
        api
          .get("/fixtures/leagues/", { params: { priority_only: priorityOnly } })
          .then((response) => parseLeagues(response.data)),
      // Fallback para dados mock
      () => Promise.resolve(mockLeagues),
    ]);
  },

  // Status da API
  getApiStatus: async (): Promise<ApiStatus> => {
    return requestWithFallback<ApiStatus>([
      () =>
        api
          .get("/fixtures/api/status")
          .then((response) => parseApiStatus(response.data)),
      // Fallback para status mock
      () =>
        Promise.resolve({
          remaining_requests: 85,
          max_requests_per_day: 100,
          usage_percent: 15.0,
        }),
    ]);
  },

  // Obter detalhes de um fixture específico
  getFixture: async (fixtureId: number): Promise<FixtureSearchResult | null> => {
    return requestWithFallback<FixtureSearchResult | null>([
      () =>
        api
          .get(`/fixtures/${fixtureId}`)
          .then((response) => {
            const results = parseFixtureSearchResults([response.data]);
            return results[0] || null;
          }),
      // Fallback para dados mock
      () => {
        const fixture = mockFixtures.find((f) => f.id === fixtureId);
        return Promise.resolve(fixture || null);
      },
    ]);
  },

  // Obter eventos do dia (para página /eventos)
  getEvents: async (params: GetEventsParams = {}): Promise<EventsResponse> => {
    const { date, limit = 20 } = params;

    console.log("[fixturesService] Getting events for date:", date || "today");

    try {
      const queryParams: Record<string, string | number> = { limit };
      if (date) {
        queryParams.date = date;
      }

      const response = await api.get("/fixtures/events/v2", { params: queryParams });
      console.log("[fixturesService] Events response:", response.data);

      const data = response.data;
      
      // Parsear resposta
      if (data && typeof data === "object" && Array.isArray(data.items)) {
        return {
          items: data.items.map((item: Record<string, unknown>) => ({
            id: String(item.id || ""),
            fixture_id: typeof item.fixture_id === "number" ? item.fixture_id : 0,
            date: typeof item.date === "string" ? item.date : "",
            time: typeof item.time === "string" ? item.time : "",
            league: typeof item.league === "string" ? item.league : "",
            league_country: typeof item.league_country === "string" ? item.league_country : "",
            league_logo: typeof item.league_logo === "string" ? item.league_logo : null,
            home_team: typeof item.home_team === "string" ? item.home_team : "",
            away_team: typeof item.away_team === "string" ? item.away_team : "",
            home_team_short: typeof item.home_team_short === "string" ? item.home_team_short : "",
            away_team_short: typeof item.away_team_short === "string" ? item.away_team_short : "",
            home_team_logo: typeof item.home_team_logo === "string" ? item.home_team_logo : null,
            away_team_logo: typeof item.away_team_logo === "string" ? item.away_team_logo : null,
            home_odd: typeof item.home_odd === "number" ? item.home_odd : null,
            draw_odd: typeof item.draw_odd === "number" ? item.draw_odd : null,
            away_odd: typeof item.away_odd === "number" ? item.away_odd : null,
            is_live: item.is_live === true,
          })),
          total: typeof data.total === "number" ? data.total : 0,
          date: typeof data.date === "string" ? data.date : "",
        };
      }

      return { items: [], total: 0, date: date || "" };
    } catch (error) {
      console.error("[fixturesService] Error getting events:", error);
      return { items: [], total: 0, date: date || "" };
    }
  },
};

