import { api, DEMO_USER_ID, requestWithFallback, unwrapApiResponse } from "@/lib/api";
import { Bet } from "@/lib/mockData";

type RawBet = Record<string, unknown>;

const getValue = (source: RawBet, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in source) {
      return source[key as keyof RawBet];
    }
  }
  return undefined;
};

const normalizeResult = (value: unknown): Bet["result"] => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (["win", "loss", "pending", "void", "cashout"].includes(normalized)) {
      return normalized as Bet["result"];
    }

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

const normalizeBet = (bet: RawBet): Bet => {
  const rawId = getValue(bet, [
    "id",
    "bet_id",
    "betId",
    "order_id",
    "ordem_id",
    "reference",
    "uuid",
    "external_id",
  ]);

  const rawUserId = getValue(bet, ["user_id", "userId"]);
  const rawEvent = getValue(bet, ["event", "event_name", "fixture", "match", "game"]);
  const rawMarket = getValue(bet, ["market", "market_name", "selection", "strategy"]);
  const rawCreatedAt =
    getValue(bet, ["created_at", "createdAt", "timestamp", "date", "placed_at"]) ??
    new Date().toISOString();
  const rawUpdatedAt = getValue(bet, ["updated_at", "updatedAt", "modified_at", "modifiedAt"]);

  return {
    id: rawId ? String(rawId) : `bet-${Math.random().toString(36).slice(2)}`,
    user_id: typeof rawUserId === "string" ? rawUserId : undefined,
    event: typeof rawEvent === "string" ? rawEvent : "",
    market: typeof rawMarket === "string" ? rawMarket : "",
    odd: normalizeNumber(getValue(bet, ["odd", "odds", "price"])),
    stake: normalizeNumber(getValue(bet, ["stake", "amount", "value"])),
    result: normalizeResult(getValue(bet, ["result", "status", "outcome"])),
    profit: normalizeNumber(
      getValue(bet, ["profit", "net_profit", "payout", "return", "net", "cashout"])
    ),
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
    return unwrapped.map((item) => normalizeBet((item ?? {}) as RawBet));
  }

  if (unwrapped && typeof unwrapped === "object") {
    const container = unwrapped as Record<string, unknown>;

    for (const key of ["bets", "items", "results", "data"]) {
      const value = container[key];
      if (Array.isArray(value)) {
        return value.map((item) => normalizeBet((item ?? {}) as RawBet));
      }
    }
  }

  return [];
};

const parseSingleBet = (payload: unknown): Bet => {
  const unwrapped = unwrapApiResponse<unknown>(payload);

  if (Array.isArray(unwrapped)) {
    return normalizeBet((unwrapped[0] ?? {}) as RawBet);
  }

  if (unwrapped && typeof unwrapped === "object") {
    const container = unwrapped as Record<string, unknown>;
    if (container.bet && typeof container.bet === "object") {
      return normalizeBet(container.bet as RawBet);
    }
  }

  return normalizeBet((unwrapped ?? {}) as RawBet);
};

export interface CreateBetDTO {
  user_id: string;
  event: string;
  market: string;
  odd: number;
  stake: number;
  result: "win" | "loss" | "pending" | "void" | "cashout";
  profit: number;
  created_at?: string;
}

export interface UpdateBetDTO {
  event?: string;
  market?: string;
  odd?: number;
  stake?: number;
  result?: "win" | "loss" | "pending" | "void" | "cashout";
  profit?: number;
}

export const betsService = {
  // Listar todas as apostas
  getBets: async (userId: string = DEMO_USER_ID): Promise<Bet[]> =>
    requestWithFallback<Bet[]>([
      () => api.get(`/users/${userId}/bets`).then((response) => parseBetList(response.data)),
      () =>
        api
          .get(`/bets/`, { params: { user_id: userId } })
          .then((response) => parseBetList(response.data)),
    ]),

  // Criar nova aposta
  createBet: async (bet: Omit<CreateBetDTO, "user_id">): Promise<Bet> => {
    const payload = {
      ...bet,
      user_id: DEMO_USER_ID,
    };

    return requestWithFallback<Bet>([
      () =>
        api
          .post(`/users/${DEMO_USER_ID}/bets`, payload)
          .then((response) => parseSingleBet(response.data)),
      () => api.post(`/bets/`, payload).then((response) => parseSingleBet(response.data)),
    ]);
  },

  // Atualizar aposta existente
  updateBet: async (betId: string, data: UpdateBetDTO): Promise<Bet> =>
    requestWithFallback<Bet>([
      () =>
        api
          .patch(`/users/${DEMO_USER_ID}/bets/${betId}`, data)
          .then((response) => parseSingleBet(response.data)),
      () =>
        api
          .patch(`/bets/${betId}`, data)
          .then((response) => parseSingleBet(response.data)),
    ]),

  // Deletar aposta
  deleteBet: async (betId: string): Promise<void> => {
    await requestWithFallback<unknown>([
      () => api.delete(`/users/${DEMO_USER_ID}/bets/${betId}`),
      () => api.delete(`/bets/${betId}`),
    ]);
  },
};
