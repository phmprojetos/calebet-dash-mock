import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { startOfDay, endOfDay, subDays, isWithinInterval } from "date-fns";
import { Bet, Stats, MarketStats } from "./mockData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterBetsByDateRange(bets: Bet[], startDate: Date, endDate: Date): Bet[] {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  return bets.filter(bet => {
    const betDate = new Date(bet.created_at);
    return isWithinInterval(betDate, { start, end });
  });
}

export function calculateStats(bets: Bet[]): Stats {
  const total_bets = bets.length;
  const total_stake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const total_profit = bets.reduce((sum, bet) => sum + bet.profit, 0);
  const avg_odd = total_bets > 0 ? bets.reduce((sum, bet) => sum + bet.odd, 0) / total_bets : 0;
  
  const by_result = {
    win: bets.filter(b => b.result === "win").length,
    loss: bets.filter(b => b.result === "loss").length,
    pending: bets.filter(b => b.result === "pending").length,
    void: bets.filter(b => b.result === "void").length,
    cashout: bets.filter(b => b.result === "cashout").length,
  };
  
  const win_rate = total_bets > 0 ? Math.round((by_result.win / total_bets) * 100) : 0;
  const roi = total_stake > 0 ? (total_profit / total_stake) * 100 : 0;
  
  // Calculate by_market
  const by_market: Record<string, MarketStats> = {};
  bets.forEach(bet => {
    if (!by_market[bet.market]) {
      by_market[bet.market] = {
        total_bets: 0,
        wins: 0,
        losses: 0,
        cashouts: 0,
        cashouts_positive: 0,
        total_stake: 0,
        total_profit: 0,
        win_rate: 0,
        roi: 0,
      };
    }
    
    const market = by_market[bet.market];
    market.total_bets++;
    market.total_stake += bet.stake;
    market.total_profit += bet.profit;
    
    if (bet.result === "win") market.wins++;
    if (bet.result === "loss") market.losses++;
    if (bet.result === "cashout") {
      market.cashouts++;
      if (bet.profit > 0) market.cashouts_positive++;
    }
  });
  
  // Calculate win_rate and ROI for each market
  Object.keys(by_market).forEach(marketName => {
    const market = by_market[marketName];
    market.win_rate = market.total_bets > 0 
      ? Math.round((market.wins / market.total_bets) * 100) 
      : 0;
    market.roi = market.total_stake > 0 
      ? (market.total_profit / market.total_stake) * 100 
      : 0;
  });
  
  // Find best and worst markets
  const marketEntries = Object.entries(by_market);
  let best_market = "";
  let worst_market = "";
  let best_roi = -Infinity;
  let worst_roi = Infinity;
  
  marketEntries.forEach(([name, stats]) => {
    if (stats.roi > best_roi) {
      best_roi = stats.roi;
      best_market = name;
    }
    if (stats.roi < worst_roi) {
      worst_roi = stats.roi;
      worst_market = name;
    }
  });
  
  const positive_cashouts = bets.filter(b => b.result === "cashout" && b.profit > 0).length;
  const positive_cashouts_profit = bets
    .filter(b => b.result === "cashout" && b.profit > 0)
    .reduce((sum, bet) => sum + bet.profit, 0);
  
  return {
    total_bets,
    total_stake,
    total_profit,
    avg_odd,
    win_rate,
    roi,
    monthly_performance: [],
    by_result,
    by_market,
    best_market,
    worst_market,
    positive_cashouts,
    positive_cashouts_profit,
  };
}

export function getDateRange(period: "today" | "7days" | "30days" | "all"): { start: Date; end: Date } {
  const now = new Date();
  const end = endOfDay(now);
  
  switch (period) {
    case "today":
      return { start: startOfDay(now), end };
    case "7days":
      return { start: startOfDay(subDays(now, 6)), end };
    case "30days":
      return { start: startOfDay(subDays(now, 29)), end };
    case "all":
      return { start: new Date("2025-01-01"), end };
    default:
      return { start: new Date("2025-01-01"), end };
  }
}
