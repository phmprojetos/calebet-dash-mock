import { api, DEMO_USER_ID, requestWithFallback, unwrapApiResponse } from "@/lib/api";
import { Bet, PaginatedBetsResponse, GetBetsParams } from "@/lib/mockData";

type RawBet = Record<string, unknown>;

const getValue = (source: RawBet, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in source) {
      return source[key as keyof RawBet];
    }
  }
  return undefined;
};

const ensureRecord = (value: unknown): RawBet => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as RawBet;
  }

  return {};
};

const normalizeResult = (value: unknown): Bet["result"] => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    // Mapeamento direto para resultados conhecidos
    if (["win", "loss", "pending", "void", "cashout"].includes(normalized)) {
      return normalized as Bet["result"];
    }
    // Mapeamento da nova API: won -> win, lost -> loss
    if (normalized === "won") return "win";
    if (normalized === "lost" || normalized === "lose") return "loss";
  }

  return "pending";
};

const normalizeNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeIntegerOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeStringOrNull = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.length > 0) return value;
  return null;
};

const normalizeBet = (rawBet: unknown): Bet => {
  const bet = ensureRecord(rawBet);
  // ordem_id é o novo campo primário da API
  const rawId = getValue(bet, [
    "ordem_id",
    "id",
    "bet_id",
    "betId",
    "order_id",
    "reference",
    "uuid",
    "external_id",
  ]);

  const rawUserId = getValue(bet, ["user_id", "userId"]);
  const rawFixtureId = getValue(bet, ["fixture_id", "fixtureId"]);
  const rawHomeTeam = getValue(bet, ["home_team", "homeTeam", "home_team_name"]);
  const rawAwayTeam = getValue(bet, ["away_team", "awayTeam", "away_team_name"]);
  const rawEvent = getValue(bet, ["event", "event_name", "fixture", "match", "game"]);
  const rawMarket = getValue(bet, ["market", "market_name", "selection", "strategy"]);
  const rawCreatedAt =
    getValue(bet, ["created_at", "createdAt", "timestamp", "date", "placed_at"]) ??
    new Date().toISOString();
  const rawUpdatedAt = getValue(bet, ["updated_at", "updatedAt", "modified_at", "modifiedAt"]);
  const rawSource = getValue(bet, ["source", "origin", "provider"]);
  const rawPayoutValue = getValue(bet, ["payout_value", "payout"]);
  const rawIsLive = getValue(bet, ["is_live", "isLive", "live"]);
  const rawImageUrl = getValue(bet, ["image_url", "imageUrl", "image"]);

  const homeTeam = normalizeStringOrNull(rawHomeTeam);
  const awayTeam = normalizeStringOrNull(rawAwayTeam);

  // Se event não existir mas temos home_team e away_team, gerar automaticamente
  let event = typeof rawEvent === "string" ? rawEvent : "";
  if (!event && homeTeam && awayTeam) {
    event = `${homeTeam} vs ${awayTeam}`;
  }

  return {
    id: rawId ? String(rawId) : `bet-${Math.random().toString(36).slice(2)}`,
    user_id: typeof rawUserId === "string" ? rawUserId : undefined,
    fixture_id: normalizeIntegerOrNull(rawFixtureId),
    home_team: homeTeam,
    away_team: awayTeam,
    event,
    market: typeof rawMarket === "string" ? rawMarket : "",
    odd: normalizeNumber(getValue(bet, ["odd", "odds", "price"])),
    stake: normalizeNumber(getValue(bet, ["stake", "amount", "value"])),
    payout_value: normalizeNumberOrNull(rawPayoutValue),
    profit: normalizeNumberOrNull(
      getValue(bet, ["profit", "net_profit", "return", "net"])
    ),
    result: normalizeResult(getValue(bet, ["result", "status", "outcome"])),
    is_live: typeof rawIsLive === "boolean" ? rawIsLive : false,
    source: typeof rawSource === "string" ? rawSource : undefined,
    image_url: typeof rawImageUrl === "string" ? rawImageUrl : null,
    created_at: typeof rawCreatedAt === "string" ? rawCreatedAt : new Date().toISOString(),
    updated_at:
      typeof rawUpdatedAt === "string"
        ? rawUpdatedAt
        : rawUpdatedAt === null
          ? null
          : undefined,
  };
};

const parseBetList = (payload: unknown): Bet[] => {
  const unwrapped = unwrapApiResponse<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return unwrapped.map((item) => normalizeBet(item ?? {}));
  }

  if (unwrapped && typeof unwrapped === "object") {
    const container = unwrapped as Record<string, unknown>;

    for (const key of ["bets", "items", "results", "data"]) {
      const value = container[key];
      if (Array.isArray(value)) {
        return value.map((item) => normalizeBet(item ?? {}));
      }
    }
  }

  return [];
};

const parsePaginatedBets = (payload: unknown): PaginatedBetsResponse => {
  // A resposta já vem no formato paginado, não precisa unwrap
  if (payload && typeof payload === "object") {
    const container = payload as Record<string, unknown>;
    
    // Verificar se é resposta paginada
    if ("items" in container && Array.isArray(container.items)) {
      return {
        items: container.items.map((item) => normalizeBet(item ?? {})),
        total: typeof container.total === "number" ? container.total : 0,
        page: typeof container.page === "number" ? container.page : 1,
        limit: typeof container.limit === "number" ? container.limit : 20,
        total_pages: typeof container.total_pages === "number" ? container.total_pages : 1,
      };
    }
  }

  // Fallback: se receber array direto, converter para formato paginado
  const items = parseBetList(payload);
  return {
    items,
    total: items.length,
    page: 1,
    limit: items.length || 20,
    total_pages: 1,
  };
};

const parseSingleBet = (payload: unknown): Bet => {
  const unwrapped = unwrapApiResponse<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return normalizeBet(unwrapped[0] ?? {});
  }

  if (unwrapped && typeof unwrapped === "object") {
    const container = unwrapped as Record<string, unknown>;
    if (container.bet && typeof container.bet === "object") {
      return normalizeBet(container.bet);
    }
  }

  return normalizeBet(unwrapped ?? {});
};

// DTO para criar aposta - Opção A: Com Fixture Selecionado (Recomendado)
export interface CreateBetWithFixtureDTO {
  user_id: string;
  fixture_id: number;
  home_team: string;
  away_team: string;
  market: string;
  odd: number;
  stake: number;
  source?: string;
  is_live?: boolean;
}

// DTO para criar aposta - Opção B: Entrada Manual
export interface CreateBetManualDTO {
  user_id: string;
  home_team: string;
  away_team: string;
  market: string;
  odd: number;
  stake: number;
  source?: string;
  is_live?: boolean;
}

// DTO unificado que suporta ambos os modos
export type CreateBetDTO = CreateBetWithFixtureDTO | CreateBetManualDTO;

// DTO legado para compatibilidade com código existente
export interface CreateBetLegacyDTO {
  user_id: string;
  event: string;
  market: string;
  odd: number;
  stake: number;
  result: "win" | "loss" | "pending" | "void" | "cashout";
  profit: number;
  created_at?: string;
  source?: string;
}

export interface UpdateBetDTO {
  home_team?: string;
  away_team?: string;
  event?: string;
  market?: string;
  odd?: number;
  stake?: number;
  result?: "win" | "loss" | "pending" | "void" | "cashout";
  profit?: number;
}

export const betsService = {
  // Listar todas as apostas com paginação
  getBets: async (params: GetBetsParams = {}): Promise<PaginatedBetsResponse> => {
    const targetUserId = params.user_id || DEMO_USER_ID;

    const queryParams: Record<string, string | number> = {
      user_id: targetUserId,
    };

    if (params.filter) {
      queryParams.filter = params.filter;
    }
    if (params.start_date) {
      queryParams.start_date = params.start_date;
    }
    if (params.end_date) {
      queryParams.end_date = params.end_date;
    }
    if (params.page) {
      queryParams.page = params.page;
    }
    if (params.limit) {
      queryParams.limit = params.limit;
    }

    return requestWithFallback<PaginatedBetsResponse>([
      () =>
        api
          .get(`/bets/`, { params: queryParams })
          .then((response) => parsePaginatedBets(response.data)),
      () =>
        api
          .get(`/users/${targetUserId}/bets`, { params: queryParams })
          .then((response) => parsePaginatedBets(response.data)),
    ]);
  },

  // Criar nova aposta - suporta ambos os modos (com fixture ou manual)
  createBet: async (
    bet: (Omit<CreateBetDTO, "user_id"> | Omit<CreateBetLegacyDTO, "user_id">) & { user_id?: string }
  ): Promise<Bet> => {
    const targetUserId = bet.user_id || DEMO_USER_ID;

    // Construir payload baseado nos campos disponíveis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      user_id: targetUserId,
      source: bet.source ?? "dashboard",
    };

    // Verificar se é o formato novo (com home_team/away_team) ou legado (com event)
    if ("home_team" in bet && "away_team" in bet) {
      payload.home_team = bet.home_team;
      payload.away_team = bet.away_team;

      if ("fixture_id" in bet && bet.fixture_id) {
        payload.fixture_id = bet.fixture_id;
      }
    } else if ("event" in bet) {
      // Formato legado - extrair home_team e away_team do event se possível
      const eventParts = bet.event.split(/\s+(?:vs?|x)\s+/i);
      if (eventParts.length === 2) {
        payload.home_team = eventParts[0].trim();
        payload.away_team = eventParts[1].trim();
      } else {
        // Fallback: enviar o event como home_team (backend vai lidar)
        payload.home_team = bet.event;
        payload.away_team = "";
      }
    }

    // Campos comuns
    payload.market = bet.market;
    payload.odd = bet.odd;
    payload.stake = bet.stake;

    if ("is_live" in bet) {
      payload.is_live = bet.is_live;
    }

    return requestWithFallback<Bet>([
      () => api.post(`/bets/`, payload).then((response) => parseSingleBet(response.data)),
      () =>
        api
          .post(`/users/${targetUserId}/bets`, payload)
          .then((response) => parseSingleBet(response.data)),
      () => api.post(`/ingest`, payload).then((response) => parseSingleBet(response.data)),
    ]);
  },

  // Atualizar aposta existente
  updateBet: async (betId: string, data: UpdateBetDTO): Promise<Bet> =>
    requestWithFallback<Bet>([
      () =>
        api
          .patch(`/bets/${betId}`, data)
          .then((response) => parseSingleBet(response.data)),
      () =>
        api
          .patch(`/users/${DEMO_USER_ID}/bets/${betId}`, data)
          .then((response) => parseSingleBet(response.data)),
    ]),

  // Deletar aposta
  deleteBet: async (betId: string): Promise<void> => {
    await requestWithFallback<unknown>([
      () => api.delete(`/bets/${betId}`),
      () => api.delete(`/users/${DEMO_USER_ID}/bets/${betId}`),
    ]);
  },
};
