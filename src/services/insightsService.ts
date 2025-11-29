import { api, DEMO_USER_ID, requestWithFallback, unwrapApiResponse } from "@/lib/api";
import { Bet } from "@/lib/mockData";
import { betsService } from "./betsService";

export interface Insight {
  id: string;
  type: "success" | "warning" | "info" | "danger";
  title: string;
  message: string;
  market?: string;
  metrics?: {
    roi?: number;
    winRate?: number;
    totalProfit?: number;
    totalBets?: number;
  };
  recommendation?: string;
}

export interface InsightsResponse {
  insights: Insight[];
}

interface MarketAnalysis {
  market: string;
  totalBets: number;
  wins: number;
  losses: number;
  totalStake: number;
  totalProfit: number;
  winRate: number;
  roi: number;
  avgOdd: number;
  volatility: number; // Desvio padrão dos resultados
  profits: number[];
}

// Analisar apostas e gerar insights baseados em dados reais
async function analyzeBetsAndGenerateInsights(userId: string): Promise<Insight[]> {
  try {
    // Buscar todas as apostas do usuário (últimos 100 para análise)
    const betsResponse = await betsService.getBets({
      user_id: userId,
      limit: 100,
    });

    const bets = betsResponse.items.filter(
      (bet) => bet.result !== "pending" && bet.result !== "void"
    );

    if (bets.length === 0) {
      return [
        {
          id: "no-data",
          type: "info",
          title: "Sem dados suficientes",
          message: "Você ainda não tem apostas suficientes para análise. Comece a apostar para receber insights personalizados!",
        },
      ];
    }

    // Analisar performance por mercado
    const marketAnalysis = new Map<string, MarketAnalysis>();

    bets.forEach((bet) => {
      if (!bet.market) return;

      const analysis = marketAnalysis.get(bet.market) || {
        market: bet.market,
        totalBets: 0,
        wins: 0,
        losses: 0,
        totalStake: 0,
        totalProfit: 0,
        winRate: 0,
        roi: 0,
        avgOdd: 0,
        profits: [] as number[],
      };

      analysis.totalBets++;
      analysis.totalStake += bet.stake;
      analysis.avgOdd += bet.odd;

      if (bet.result === "win" && bet.profit !== null) {
        analysis.wins++;
        analysis.totalProfit += bet.profit;
        analysis.profits.push(bet.profit);
      } else if (bet.result === "loss" && bet.profit !== null) {
        analysis.losses++;
        analysis.totalProfit += bet.profit; // profit já é negativo
        analysis.profits.push(bet.profit);
      }

      marketAnalysis.set(bet.market, analysis);
    });

    // Calcular métricas finais
    const analyzedMarkets: MarketAnalysis[] = Array.from(marketAnalysis.values()).map((analysis) => {
      const winRate = (analysis.wins / analysis.totalBets) * 100;
      const roi = analysis.totalStake > 0 ? (analysis.totalProfit / analysis.totalStake) * 100 : 0;
      const avgOdd = analysis.avgOdd / analysis.totalBets;

      // Calcular volatilidade (desvio padrão dos profits)
      const avgProfit = analysis.profits.length > 0
        ? analysis.profits.reduce((a, b) => a + b, 0) / analysis.profits.length
        : 0;
      const variance = analysis.profits.length > 0
        ? analysis.profits.reduce((sum, profit) => sum + Math.pow(profit - avgProfit, 2), 0) / analysis.profits.length
        : 0;
      const volatility = Math.sqrt(variance);

      return {
        ...analysis,
        winRate,
        roi,
        avgOdd,
        volatility,
      };
    });

    // Gerar insights baseados na análise
    const insights: Insight[] = [];

    // 1. Identificar mercados com melhor ROI
    const bestMarkets = analyzedMarkets
      .filter((m) => m.totalBets >= 3 && m.roi > 10)
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 2);

    bestMarkets.forEach((market) => {
      insights.push({
        id: `best-market-${market.market}`,
        type: "success",
        title: "🎯 Mercado de Alto Desempenho",
        message: `Você está tendo excelente performance no mercado "${market.market}". Com ${market.winRate.toFixed(1)}% de acerto e ROI de ${market.roi.toFixed(1)}%, este é um mercado forte para você.`,
        market: market.market,
        metrics: {
          roi: market.roi,
          winRate: market.winRate,
          totalProfit: market.totalProfit,
          totalBets: market.totalBets,
        },
        recommendation: `Continue focando em "${market.market}". Você já ganhou R$ ${market.totalProfit.toFixed(2)} neste mercado.`,
      });
    });

    // 2. Identificar mercados problemáticos
    const worstMarkets = analyzedMarkets
      .filter((m) => m.totalBets >= 3 && m.roi < -20)
      .sort((a, b) => a.roi - b.roi)
      .slice(0, 2);

    worstMarkets.forEach((market) => {
      insights.push({
        id: `worst-market-${market.market}`,
        type: "danger",
        title: "⚠️ Mercado com Prejuízo",
        message: `O mercado "${market.market}" está gerando prejuízo significativo. Com apenas ${market.winRate.toFixed(1)}% de acerto e ROI negativo de ${market.roi.toFixed(1)}%, você perdeu R$ ${Math.abs(market.totalProfit).toFixed(2)} neste mês.`,
        market: market.market,
        metrics: {
          roi: market.roi,
          winRate: market.winRate,
          totalProfit: market.totalProfit,
          totalBets: market.totalBets,
        },
        recommendation: `Considere evitar ou reduzir apostas em "${market.market}" até revisar sua estratégia.`,
      });
    });

    // 3. Identificar alta volatilidade
    const volatileMarkets = analyzedMarkets
      .filter((m) => m.totalBets >= 5 && m.volatility > 500)
      .sort((a, b) => b.volatility - a.volatility)
      .slice(0, 1);

    volatileMarkets.forEach((market) => {
      insights.push({
        id: `volatile-market-${market.market}`,
        type: "warning",
        title: "📊 Alta Volatilidade Detectada",
        message: `Você tem muita volatilidade no mercado "${market.market}". Os resultados variam muito entre vitórias e derrotas, o que pode indicar inconsistência na estratégia.`,
        market: market.market,
        metrics: {
          roi: market.roi,
          winRate: market.winRate,
          totalProfit: market.totalProfit,
          totalBets: market.totalBets,
        },
        recommendation: `Reavalie sua estratégia em "${market.market}". Considere reduzir o stake ou estudar mais antes de apostar.`,
      });
    });

    // 4. Análise geral de diversificação
    if (analyzedMarkets.length > 5) {
      const topMarkets = analyzedMarkets
        .sort((a, b) => b.totalBets - a.totalBets)
        .slice(0, 3);
      const concentration = topMarkets.reduce((sum, m) => sum + m.totalBets, 0) / bets.length;

      if (concentration > 0.7) {
        insights.push({
          id: "diversification",
          type: "info",
          title: "💡 Sugestão de Diversificação",
          message: `Você está concentrando ${(concentration * 100).toFixed(0)}% das suas apostas em apenas 3 mercados. Considere diversificar mais para reduzir riscos.`,
          recommendation: "Explore outros mercados que você ainda não testou, mas mantenha foco nos que estão dando resultado.",
        });
      }
    }

    // 5. Análise de ROI geral
    const totalStake = analyzedMarkets.reduce((sum, m) => sum + m.totalStake, 0);
    const totalProfit = analyzedMarkets.reduce((sum, m) => sum + m.totalProfit, 0);
    const overallROI = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0;

    if (overallROI > 5) {
      insights.push({
        id: "overall-positive",
        type: "success",
        title: "💰 Performance Positiva",
        message: `Seu ROI geral está em ${overallROI.toFixed(1)}%, o que indica uma estratégia sólida. Continue mantendo o foco nos mercados que estão funcionando!`,
        metrics: {
          roi: overallROI,
          totalProfit,
        },
      });
    } else if (overallROI < -10) {
      insights.push({
        id: "overall-negative",
        type: "warning",
        title: "📉 Atenção Necessária",
        message: `Seu ROI geral está negativo em ${Math.abs(overallROI).toFixed(1)}%. Foque nos mercados com melhor desempenho e evite aqueles que estão gerando prejuízo.`,
        metrics: {
          roi: overallROI,
          totalProfit,
        },
        recommendation: "Revise sua estratégia e considere reduzir o stake nos mercados problemáticos.",
      });
    }

    // Ordenar insights por prioridade (danger > warning > success > info)
    const priorityOrder = { danger: 0, warning: 1, success: 2, info: 3 };
    insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return insights.slice(0, 6); // Limitar a 6 insights mais relevantes
  } catch (error) {
    console.error("Erro ao analisar apostas:", error);
    return [
      {
        id: "error",
        type: "info",
        title: "Análise Indisponível",
        message: "Não foi possível analisar suas apostas no momento. Tente novamente mais tarde.",
      },
    ];
  }
}

export const insightsService = {
  // Buscar insights da IA baseados em dados reais
  getInsights: async (userId: string = DEMO_USER_ID): Promise<Insight[]> => {
    try {
      // Tentar buscar da API primeiro
      const response = await requestWithFallback([
        () =>
          api
            .get(`/insights/${userId}`, { timeout: 60000 })
            .then((res) => res.data),
        () =>
          api
            .get(`/users/${userId}/insights`, { timeout: 60000 })
            .then((res) => res.data),
      ]);

      const payload = unwrapApiResponse<InsightsResponse | Insight[]>(response);

      if (Array.isArray(payload)) {
        return payload;
      }

      if (payload && Array.isArray(payload.insights)) {
        return payload.insights;
      }
    } catch (error) {
      // Se a API falhar, usar análise local baseada nas apostas
      console.log("API de insights não disponível, usando análise local");
    }

    // Fallback: Analisar apostas localmente e gerar insights
    return analyzeBetsAndGenerateInsights(userId);
  },
};
