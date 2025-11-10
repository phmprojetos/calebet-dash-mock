import { api, DEMO_USER_ID, requestWithFallback, unwrapApiResponse } from "@/lib/api";
import { MarketStats, Stats } from "@/lib/mockData";

type RawStats = Record<string, unknown>;

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toRecord = (value: unknown): RawStats =>
  value && typeof value === "object" ? (value as RawStats) : {};

const normalizeMarketStats = (value: unknown): MarketStats => {
  const market = toRecord(value);

  return {
    total_bets: toNumber(market.total_bets),
    wins: toNumber(market.wins),
    losses: toNumber(market.losses),
    cashouts: toNumber(market.cashouts),
    cashouts_positive: toNumber(market.cashouts_positive),
    total_stake: toNumber(market.total_stake),
    total_profit: toNumber(market.total_profit),
    win_rate: toNumber(market.win_rate),
    roi: toNumber(market.roi),
  };
};

const normalizeStats = (payload: unknown): Stats => {
  const raw = unwrapApiResponse<unknown>(payload);
  const data = toRecord(raw);

  const byResult = toRecord(data.by_result);
  const byMarketRaw =
    data.by_market && typeof data.by_market === "object"
      ? (data.by_market as Record<string, unknown>)
      : {};

  const normalizedByMarket = Object.entries(byMarketRaw).reduce<Record<string, MarketStats>>(
    (acc, [key, value]) => {
      acc[key] = normalizeMarketStats(value);
      return acc;
    },
    {}
  );

  return {
    total_bets: toNumber(data.total_bets),
    total_stake: toNumber(data.total_stake),
    total_profit: toNumber(data.total_profit),
    avg_odd: toNumber(data.avg_odd),
    win_rate: toNumber(data.win_rate),
    roi: toNumber(data.roi),
    by_result: {
      win: toNumber(byResult.win),
      loss: toNumber(byResult.loss),
      pending: toNumber(byResult.pending),
      void: toNumber(byResult.void),
      cashout: toNumber(byResult.cashout),
    },
    by_market: normalizedByMarket,
    best_market: typeof data.best_market === "string" ? data.best_market : "",
    worst_market: typeof data.worst_market === "string" ? data.worst_market : "",
    positive_cashouts: toNumber(data.positive_cashouts),
    positive_cashouts_profit: toNumber(data.positive_cashouts_profit),
  };
};

export interface StatsParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const statsService = {
  // Buscar estatísticas do usuário
  getStats: async (params: StatsParams = {}): Promise<Stats> => {
    const userId = params.userId || DEMO_USER_ID;

    const response = await requestWithFallback([
      () => api.get(`/users/${userId}/stats`).then((res) => res.data),
      () => api.get(`/stats/${userId}`).then((res) => res.data),
    ]);

    return normalizeStats(response);
  },
};
