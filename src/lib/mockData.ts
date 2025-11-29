// Mock data for CALEBet Dashboard

export interface Bet {
  id: string;
  user_id?: string;
  event: string;
  market: string;
  odd: number;
  stake: number;
  payout_value?: number | null;
  profit: number | null;
  result: "win" | "loss" | "pending" | "void" | "cashout";
  is_live?: boolean;
  source?: string;
  image_url?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PaginatedBetsResponse {
  items: Bet[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetBetsParams {
  user_id?: string;
  filter?: "today" | "this_week" | "this_month";
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
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

export interface MonthlyPerformance {
  month: string;
  gains: number;
  losses: number;
}

export interface Stats {
  total_bets: number;
  total_stake: number;
  total_profit: number;
  avg_odd: number;
  win_rate: number;
  roi: number;
  monthly_performance: MonthlyPerformance[];
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
  monthly_performance: [
    { month: "Jun/24", gains: 4820, losses: 3680 },
    { month: "Jul/24", gains: 4510, losses: 4120 },
    { month: "Ago/24", gains: 4985, losses: 3275 },
    { month: "Set/24", gains: 5120, losses: 4390 },
    { month: "Out/24", gains: 4760, losses: 5025 },
    { month: "Nov/24", gains: 4380, losses: 5290 },
    { month: "Dez/24", gains: 5210, losses: 3180 },
    { month: "Jan/25", gains: 4850, losses: 3920 },
  ],
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
  // Últimos 7 dias
  { id: "ORD-001", event: "Flamengo x Palmeiras", market: "Over 1 HT Asiático", odd: 1.92, stake: 500, result: "win", profit: 460, created_at: "2025-11-04T14:12:00Z" },
  { id: "ORD-002", event: "Corinthians x Grêmio", market: "Ambas Marcam", odd: 2.05, stake: 500, result: "loss", profit: -500, created_at: "2025-11-03T18:45:00Z" },
  { id: "ORD-003", event: "São Paulo x Santos", market: "Over 1 HT Asiático", odd: 1.88, stake: 500, result: "win", profit: 440, created_at: "2025-11-02T20:30:00Z" },
  { id: "ORD-004", event: "Internacional x Athletico", market: "Resultado Final", odd: 2.20, stake: 500, result: "loss", profit: -500, created_at: "2025-11-01T19:00:00Z" },
  { id: "ORD-005", event: "Botafogo x Vasco", market: "Over 2.5 Gols", odd: 1.95, stake: 500, result: "loss", profit: -500, created_at: "2025-10-31T21:00:00Z" },
  { id: "ORD-006", event: "Cruzeiro x Atlético-MG", market: "Over 1 HT Asiático", odd: 1.90, stake: 500, result: "win", profit: 450, created_at: "2025-10-30T16:00:00Z" },
  { id: "ORD-007", event: "Fortaleza x Ceará", market: "Ambas Marcam", odd: 2.10, stake: 500, result: "loss", profit: -500, created_at: "2025-10-29T17:30:00Z" },
  
  // 7-30 dias
  { id: "ORD-008", event: "Bahia x Vitória", market: "Over 1 HT Asiático", odd: 1.85, stake: 500, result: "win", profit: 425, created_at: "2025-10-28T15:00:00Z" },
  { id: "ORD-009", event: "Fluminense x Cuiabá", market: "Resultado Final", odd: 1.75, stake: 500, result: "win", profit: 375, created_at: "2025-10-27T19:30:00Z" },
  { id: "ORD-010", event: "América-MG x Goiás", market: "Over 2.5 Gols", odd: 2.00, stake: 500, result: "loss", profit: -500, created_at: "2025-10-26T18:00:00Z" },
  { id: "ORD-011", event: "Sport x Náutico", market: "Over 1 HT Asiático", odd: 1.95, stake: 500, result: "win", profit: 475, created_at: "2025-10-25T20:00:00Z" },
  { id: "ORD-012", event: "Coritiba x Paraná", market: "Ambas Marcam", odd: 2.15, stake: 500, result: "loss", profit: -500, created_at: "2025-10-24T17:00:00Z" },
  { id: "ORD-013", event: "Avaí x Figueirense", market: "Over 1 HT Asiático", odd: 1.88, stake: 500, result: "win", profit: 440, created_at: "2025-10-23T19:45:00Z" },
  { id: "ORD-014", event: "Ponte Preta x Guarani", market: "Handicap Asiático", odd: 1.98, stake: 500, result: "loss", profit: -500, created_at: "2025-10-22T16:30:00Z" },
  { id: "ORD-015", event: "Sampaio Corrêa x Juventude", market: "Over 1 HT Asiático", odd: 1.92, stake: 500, result: "win", profit: 460, created_at: "2025-10-21T18:15:00Z" },
  { id: "ORD-016", event: "CRB x CSA", market: "Resultado Final", odd: 2.30, stake: 500, result: "loss", profit: -500, created_at: "2025-10-20T20:30:00Z" },
  { id: "ORD-017", event: "Botafogo-SP x Mirassol", market: "Over 2.5 Gols", odd: 1.90, stake: 500, result: "loss", profit: -500, created_at: "2025-10-19T17:00:00Z" },
  { id: "ORD-018", event: "Chapecoense x Brusque", market: "Over 1 HT Asiático", odd: 1.87, stake: 500, result: "win", profit: 435, created_at: "2025-10-18T19:00:00Z" },
  { id: "ORD-019", event: "Londrina x Operário", market: "Ambas Marcam", odd: 2.05, stake: 500, result: "loss", profit: -500, created_at: "2025-10-17T18:30:00Z" },
  { id: "ORD-020", event: "Criciúma x Ituano", market: "Over 1 HT Asiático", odd: 1.93, stake: 500, result: "win", profit: 465, created_at: "2025-10-16T20:00:00Z" },
  { id: "ORD-021", event: "Tombense x Vila Nova", market: "Resultado Final", odd: 2.10, stake: 500, result: "win", profit: 550, created_at: "2025-10-15T17:45:00Z" },
  
  // 30-60 dias
  { id: "ORD-022", event: "ABC x Santa Cruz", market: "Over 2.5 Gols", odd: 2.05, stake: 500, result: "loss", profit: -500, created_at: "2025-10-14T19:30:00Z" },
  { id: "ORD-023", event: "Remo x Paysandu", market: "Over 1 HT Asiático", odd: 1.89, stake: 500, result: "win", profit: 445, created_at: "2025-10-13T18:00:00Z" },
  { id: "ORD-024", event: "Novorizontino x Ferroviária", market: "Handicap Asiático", odd: 1.95, stake: 500, result: "loss", profit: -500, created_at: "2025-10-12T16:30:00Z" },
  { id: "ORD-025", event: "Vitória x Bahia", market: "Ambas Marcam", odd: 2.00, stake: 500, result: "win", profit: 500, created_at: "2025-10-11T20:15:00Z" },
  { id: "ORD-026", event: "Atlético-GO x Goiás", market: "Over 1 HT Asiático", odd: 1.91, stake: 500, result: "win", profit: 455, created_at: "2025-10-10T19:00:00Z" },
  { id: "ORD-027", event: "Ceará x Fortaleza", market: "Resultado Final", odd: 2.25, stake: 500, result: "loss", profit: -500, created_at: "2025-10-09T21:00:00Z" },
  { id: "ORD-028", event: "Grêmio x Internacional", market: "Over 2.5 Gols", odd: 1.88, stake: 500, result: "loss", profit: -500, created_at: "2025-10-08T18:30:00Z" },
  { id: "ORD-029", event: "Santos x Palmeiras", market: "Over 1 HT Asiático", odd: 1.94, stake: 500, result: "win", profit: 470, created_at: "2025-10-07T17:00:00Z" },
  { id: "ORD-030", event: "Corinthians x São Paulo", market: "Handicap Asiático", odd: 2.10, stake: 520, result: "loss", profit: -520, created_at: "2025-10-06T20:00:00Z" },
  { id: "ORD-031", event: "Flamengo x Vasco", market: "Over 1 HT Asiático", odd: 1.86, stake: 500, result: "win", profit: 430, created_at: "2025-10-05T16:45:00Z" },
  { id: "ORD-032", event: "Botafogo x Fluminense", market: "Resultado Final", odd: 2.15, stake: 500, result: "loss", profit: -500, created_at: "2025-10-04T19:30:00Z" },
  { id: "ORD-033", event: "Athletico x Coritiba", market: "Ambas Marcam", odd: 2.08, stake: 500, result: "loss", profit: -500, created_at: "2025-10-03T18:00:00Z" },
  { id: "ORD-034", event: "Cruzeiro x América-MG", market: "Over 1 HT Asiático", odd: 1.90, stake: 500, result: "win", profit: 450, created_at: "2025-10-02T20:30:00Z" },
  { id: "ORD-035", event: "Atlético-MG x Flamengo", market: "Over 2.5 Gols", odd: 1.92, stake: 500, result: "loss", profit: -500, created_at: "2025-10-01T17:15:00Z" },
  { id: "ORD-036", event: "Palmeiras x Corinthians", market: "Handicap Asiático", odd: 2.00, stake: 500, result: "loss", profit: -500, created_at: "2025-09-30T19:00:00Z" },
  { id: "ORD-037", event: "São Paulo x Internacional", market: "Over 1 HT Asiático", odd: 1.88, stake: 500, result: "win", profit: 440, created_at: "2025-09-29T18:30:00Z" },
  { id: "ORD-038", event: "Grêmio x Botafogo", market: "Resultado Final", odd: 2.20, stake: 480, result: "loss", profit: -480, created_at: "2025-09-28T20:00:00Z" },
  { id: "ORD-039", event: "Fluminense x Santos", market: "Over 1 HT Asiático", odd: 1.95, stake: 500, result: "win", profit: 475, created_at: "2025-09-27T16:00:00Z" },
  { id: "ORD-040", event: "Vasco x Goiás", market: "Ambas Marcam", odd: 2.12, stake: 500, result: "loss", profit: -500, created_at: "2025-09-26T19:45:00Z" },
  { id: "ORD-041", event: "Cuiabá x Bahia", market: "Over 2.5 Gols", odd: 1.97, stake: 500, result: "loss", profit: -500, created_at: "2025-09-25T18:15:00Z" },
  { id: "ORD-042", event: "Fortaleza x Sport", market: "Over 1 HT Asiático", odd: 1.91, stake: 500, result: "win", profit: 455, created_at: "2025-09-24T20:30:00Z" },
  { id: "ORD-043", event: "Ceará x Vitória", market: "Resultado Final", odd: 2.18, stake: 500, result: "win", profit: 590, created_at: "2025-09-23T17:00:00Z" },
  { id: "ORD-044", event: "Guarani x Ponte Preta", market: "Over 1 HT Asiático", odd: 1.87, stake: 500, result: "win", profit: 435, created_at: "2025-09-22T19:30:00Z" },
  { id: "ORD-045", event: "Náutico x CRB", market: "Handicap Asiático", odd: 2.05, stake: 500, result: "loss", profit: -500, created_at: "2025-09-21T18:00:00Z" },
  { id: "ORD-046", event: "Avaí x Chapecoense", market: "Over 1 HT Asiático", odd: 1.93, stake: 500, result: "win", profit: 465, created_at: "2025-09-20T20:15:00Z" },
  { id: "ORD-047", event: "Mirassol x Londrina", market: "Ambas Marcam", odd: 2.10, stake: 500, result: "loss", profit: -500, created_at: "2025-09-19T16:45:00Z" },
  { id: "ORD-048", event: "Operário x Criciúma", market: "Over 1 HT Asiático", odd: 1.89, stake: 500, result: "win", profit: 445, created_at: "2025-09-18T19:00:00Z" },
  { id: "ORD-049", event: "Vila Nova x ABC", market: "Resultado Final", odd: 2.15, stake: 500, result: "loss", profit: -500, created_at: "2025-09-17T18:30:00Z" },
  { id: "ORD-050", event: "Paysandu x Remo", market: "Over 2.5 Gols", odd: 2.00, stake: 500, result: "loss", profit: -500, created_at: "2025-09-16T20:00:00Z" },
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
