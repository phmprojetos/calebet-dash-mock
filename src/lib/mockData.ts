// Mock data for CALEBet Dashboard

export interface Bet {
  ordem_id: string;
  event: string;
  market: string;
  odd: number;
  stake: number;
  result: "win" | "loss" | "pending" | "void" | "cashout";
  profit: number;
  created_at: string;
}

export interface MarketStats {
  total_bets: number;
  wins: number;
  losses: number;
  cashouts: number;
  cashouts_positive: number;
  total_stake: number;
  total_profit: number;
  win_rate: number;
  roi: number;
}

export interface Stats {
  total_bets: number;
  total_stake: number;
  total_profit: number;
  avg_odd: number;
  win_rate: number;
  roi: number;
  by_result: {
    win: number;
    loss: number;
    pending: number;
    void: number;
    cashout: number;
  };
  by_market: Record<string, MarketStats>;
  best_market: string;
  worst_market: string;
  positive_cashouts: number;
  positive_cashouts_profit: number;
}

export const mockStats: Stats = {
  total_bets: 50,
  total_stake: 25000,
  total_profit: -1737,
  avg_odd: 1.97,
  win_rate: 48,
  roi: -6.95,
  by_result: {
    win: 24,
    loss: 26,
    pending: 0,
    void: 0,
    cashout: 0,
  },
  by_market: {
    "Over 1 HT Asiático": {
      total_bets: 20,
      wins: 15,
      losses: 5,
      cashouts: 0,
      cashouts_positive: 0,
      total_stake: 10000,
      total_profit: 4216,
      win_rate: 75,
      roi: 42.16,
    },
    "Resultado Final": {
      total_bets: 7,
      wins: 2,
      losses: 5,
      cashouts: 0,
      cashouts_positive: 0,
      total_stake: 3480,
      total_profit: -1304,
      win_rate: 28.57,
      roi: -37.47,
    },
    "Ambas Marcam": {
      total_bets: 10,
      wins: 4,
      losses: 6,
      cashouts: 0,
      cashouts_positive: 0,
      total_stake: 5000,
      total_profit: -1280,
      win_rate: 40,
      roi: -25.6,
    },
    "Over 2.5 Gols": {
      total_bets: 8,
      wins: 2,
      losses: 6,
      cashouts: 0,
      cashouts_positive: 0,
      total_stake: 4000,
      total_profit: -2160,
      win_rate: 25,
      roi: -54,
    },
    "Handicap Asiático": {
      total_bets: 5,
      wins: 1,
      losses: 4,
      cashouts: 0,
      cashouts_positive: 0,
      total_stake: 2520,
      total_profit: -1209,
      win_rate: 20,
      roi: -47.98,
    },
  },
  best_market: "Over 1 HT Asiático",
  worst_market: "Over 2.5 Gols",
  positive_cashouts: 0,
  positive_cashouts_profit: 0,
};

export const mockBets: Bet[] = [
  {
    ordem_id: "ORD-001",
    event: "Flamengo x Palmeiras",
    market: "Over 1 HT Asiático",
    odd: 1.92,
    stake: 500,
    result: "win",
    profit: 460,
    created_at: "2025-10-28T14:12:00Z",
  },
  {
    ordem_id: "ORD-002",
    event: "Corinthians x Grêmio",
    market: "Ambas Marcam",
    odd: 2.05,
    stake: 500,
    result: "loss",
    profit: -500,
    created_at: "2025-10-27T18:45:00Z",
  },
  {
    ordem_id: "ORD-003",
    event: "São Paulo x Santos",
    market: "Over 1 HT Asiático",
    odd: 1.88,
    stake: 500,
    result: "win",
    profit: 440,
    created_at: "2025-10-26T20:30:00Z",
  },
  {
    ordem_id: "ORD-004",
    event: "Internacional x Athletico",
    market: "Resultado Final",
    odd: 2.20,
    stake: 500,
    result: "loss",
    profit: -500,
    created_at: "2025-10-25T19:00:00Z",
  },
  {
    ordem_id: "ORD-005",
    event: "Botafogo x Vasco",
    market: "Over 2.5 Gols",
    odd: 1.95,
    stake: 500,
    result: "loss",
    profit: -500,
    created_at: "2025-10-24T21:00:00Z",
  },
  {
    ordem_id: "ORD-006",
    event: "Cruzeiro x Atlético-MG",
    market: "Over 1 HT Asiático",
    odd: 1.90,
    stake: 500,
    result: "win",
    profit: 450,
    created_at: "2025-10-23T16:00:00Z",
  },
  {
    ordem_id: "ORD-007",
    event: "Fortaleza x Ceará",
    market: "Ambas Marcam",
    odd: 2.10,
    stake: 500,
    result: "loss",
    profit: -500,
    created_at: "2025-10-22T17:30:00Z",
  },
  {
    ordem_id: "ORD-008",
    event: "Bahia x Vitória",
    market: "Over 1 HT Asiático",
    odd: 1.85,
    stake: 500,
    result: "win",
    profit: 425,
    created_at: "2025-10-21T15:00:00Z",
  },
];

export const mockInsights = [
  {
    id: 1,
    type: "success",
    message: "🧠 Você está muito bem no mercado Over 1 HT Asiático! Com 75% de win rate e ROI de 42,16%, continue focando nesta estratégia.",
  },
  {
    id: 2,
    type: "warning",
    message: "⚠️ Considere reduzir exposição no mercado Over 2.5 Gols. Apenas 25% de aproveitamento e ROI negativo de -54%.",
  },
  {
    id: 3,
    type: "info",
    message: "📊 Seu ROI geral está em -6,95%, mas pode virar positivo se focar nos mercados de melhor desempenho.",
  },
  {
    id: 4,
    type: "success",
    message: "💰 O mercado Over 1 HT Asiático gerou R$ 4.216 de lucro em 20 apostas. Continue aproveitando esta edge!",
  },
  {
    id: 5,
    type: "warning",
    message: "🎯 Handicap Asiático tem apenas 20% de win rate. Reavalie sua estratégia neste mercado ou evite-o temporariamente.",
  },
];

export const generateRandomInsight = () => {
  return mockInsights[Math.floor(Math.random() * mockInsights.length)];
};
