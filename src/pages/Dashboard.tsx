import { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Target, Percent, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useStats } from "@/hooks/useStats";
import { useAuth } from "@/contexts/AuthContext";
import { getDateRange } from "@/lib/utils";
import { DateRangeFilter, type DateRangePeriod } from "@/components/DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { betsService } from "@/services/betsService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const initialRange = useMemo(() => getDateRange("30days"), []);
  const [startDate, setStartDate] = useState<Date>(initialRange.start);
  const [endDate, setEndDate] = useState<Date>(initialRange.end);
  const [selectedPeriod, setSelectedPeriod] = useState<DateRangePeriod>("30days");
  const [showNoBetsModal, setShowNoBetsModal] = useState(false);
  const navigate = useNavigate();

  const { data: stats, isLoading, isError, error } = useStats({ startDate, endDate });

  useEffect(() => {
    if (isError && isAxiosError(error) && error.response?.status === 404) {
      setShowNoBetsModal(true);

      if (selectedPeriod !== "30days") {
        const range = getDateRange("30days");
        setSelectedPeriod("30days");
        setStartDate(range.start);
        setEndDate(range.end);
      }
    }
  }, [isError, error, selectedPeriod]);

  const handleRangeChange = (start: Date, end: Date) => {
    setStartDate(new Date(start));
    setEndDate(new Date(end));
  };

  const filteredStats = stats;

  const hasApiMonthlyPerformance =
    (filteredStats?.monthly_performance?.length ?? 0) > 0;

  const shouldFetchAllBets = selectedPeriod === "all" && !hasApiMonthlyPerformance;

  const {
    data: allBets,
    isLoading: isLoadingAllBets,
  } = useQuery({
    queryKey: ["bets", user?.id || ""],
    queryFn: () => betsService.getBets(user?.id || ""),
    enabled: shouldFetchAllBets && !!user?.id,
  });

  const monthlyPerformanceChartData = useMemo(() => {
    const apiMonthlyPerformance = filteredStats?.monthly_performance ?? [];

    if (apiMonthlyPerformance.length > 0) {
      return apiMonthlyPerformance.map((entry) => ({
        month: entry.month,
        gains: entry.gains,
        losses: Math.abs(entry.losses),
      }));
    }

    if (!allBets || allBets.length === 0) {
      return [];
    }

    const monthlyMap = new Map<
      string,
      { month: string; gains: number; losses: number; timestamp: number }
    >();

    allBets.forEach((bet) => {
      const betDate = new Date(bet.created_at);
      const time = betDate.getTime();

      if (Number.isNaN(time)) {
        return;
      }

      const yearMonthKey = format(betDate, "yyyy-MM");
      const labelRaw = format(betDate, "MMM/yy", { locale: ptBR });
      const monthLabel = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1);
      const existing = monthlyMap.get(yearMonthKey) ?? {
        month: monthLabel,
        gains: 0,
        losses: 0,
        timestamp: new Date(betDate.getFullYear(), betDate.getMonth(), 1).getTime(),
      };

      const profit = typeof bet.profit === "number" ? bet.profit : Number(bet.profit) || 0;

      if (profit >= 0) {
        existing.gains += profit;
      } else {
        existing.losses += Math.abs(profit);
      }

      existing.month = monthLabel;
      monthlyMap.set(yearMonthKey, existing);
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((entry) => ({
        month: entry.month,
        gains: Math.round(entry.gains * 100) / 100,
        losses: Math.round(entry.losses * 100) / 100,
      }));
  }, [allBets, filteredStats]);

  const isMonthlyPerformanceLoading =
    shouldFetchAllBets && isLoadingAllBets && monthlyPerformanceChartData.length === 0;

  const resultData = filteredStats
    ? [
        {
          name: "Vitórias",
          value: filteredStats.by_result.win,
          color: "hsl(var(--success))",
          resultKey: "win" as const,
        },
        {
          name: "Derrotas",
          value: filteredStats.by_result.loss,
          color: "hsl(var(--destructive))",
          resultKey: "loss" as const,
        },
        {
          name: "Pendentes",
          value: filteredStats.by_result.pending,
          color: "hsl(var(--muted))",
          resultKey: "pending" as const,
        },
      ]
    : [];

  const marketData = filteredStats
    ? Object.entries(filteredStats.by_market).map(([name, data]) => ({
        label: name.length > 15 ? name.substring(0, 15) + "..." : name,
        key: name,
        roi: data.roi,
        winRate: data.win_rate,
      }))
    : [];

  const navigateToBets = useCallback(
    ({ result, market }: { result?: string; market?: string } = {}) => {
      const params = new URLSearchParams();
      params.set("period", selectedPeriod);

      if (selectedPeriod === "custom") {
        params.set("start", startDate.toISOString());
        params.set("end", endDate.toISOString());
      }

      if (result) {
        params.set("result", result);
      }

      if (market) {
        params.set("market", market);
      }

      navigate(`/bets?${params.toString()}`);
    },
    [endDate, navigate, selectedPeriod, startDate]
  );

  const hasLossesInPeriod = (filteredStats?.by_result.loss ?? 0) > 0;
  const bestMarketKey = filteredStats?.best_market;
  const worstMarketKey = filteredStats?.worst_market;
  const bestMarketData = bestMarketKey ? filteredStats?.by_market[bestMarketKey] : undefined;
  const worstMarketData = worstMarketKey ? filteredStats?.by_market[worstMarketKey] : undefined;
  const hasBestMarketData = Boolean(
    bestMarketKey &&
    bestMarketData &&
    bestMarketData.total_bets > 0
  );
  const hasWorstMarketData = Boolean(worstMarketKey && worstMarketData && hasLossesInPeriod);

  const handleResultClick = useCallback(
    (resultKey: "win" | "loss" | "pending") => {
      navigateToBets({ result: resultKey });
    },
    [navigateToBets]
  );

  const handleMarketClick = useCallback(
    (marketKey: string) => {
      navigateToBets({ market: marketKey });
    },
    [navigateToBets]
  );

  const isNoBetsError = isError && isAxiosError(error) && error.response?.status === 404;

  if (isError && !isNoBetsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-destructive">Erro ao carregar dados. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Visão geral das suas apostas esportivas</p>
      </div>

      <DateRangeFilter
        onRangeChange={handleRangeChange}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        customRange={selectedPeriod === "custom" ? { startDate, endDate } : undefined}
      />

      <Dialog open={showNoBetsModal} onOpenChange={setShowNoBetsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Não há bets nesse período</DialogTitle>
            <DialogDescription>
              Exibindo as apostas dos últimos 30 dias.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowNoBetsModal(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filteredStats ? (
        <>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total de Apostas"
              value={filteredStats.total_bets}
              icon={BarChart3}
              trend="neutral"
              onClick={() => navigateToBets()}
            />
            <StatCard
              title="Stake Total"
              value={`R$ ${filteredStats.total_stake.toLocaleString("pt-BR")}`}
              icon={DollarSign}
              trend="neutral"
              onClick={() => navigateToBets()}
            />
            <StatCard
              title="Lucro Total"
              value={`R$ ${filteredStats.total_profit.toLocaleString("pt-BR")}`}
              icon={filteredStats.total_profit >= 0 ? TrendingUp : TrendingDown}
              trend={filteredStats.total_profit >= 0 ? "positive" : "negative"}
              onClick={() => navigateToBets()}
            />
            <StatCard
              title="Win Rate"
              value={`${filteredStats.win_rate}%`}
              icon={Target}
              trend={filteredStats.win_rate >= 50 ? "positive" : "negative"}
              subtitle={`${filteredStats.by_result.win} vitórias / ${filteredStats.by_result.loss} derrotas`}
              onClick={() => navigateToBets()}
            />
            <StatCard
              title="ROI"
              value={`${filteredStats.roi.toFixed(2)}%`}
              icon={Percent}
              trend={filteredStats.roi >= 0 ? "positive" : "negative"}
              onClick={() => navigateToBets()}
            />
            <StatCard
              title="Odd Média"
              value={filteredStats.avg_odd.toFixed(2)}
              icon={BarChart3}
              trend="neutral"
              onClick={() => navigateToBets()}
            />
          </div>

          {selectedPeriod === "all" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Ganhos x Perdas Mensais</CardTitle>
              </CardHeader>
              <CardContent>
                {isMonthlyPerformanceLoading ? (
                  <Skeleton className="h-[320px] w-full" />
                ) : monthlyPerformanceChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={monthlyPerformanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="losses"
                        name="Perdas"
                        fill="hsl(var(--destructive))"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                      <Bar
                        dataKey="gains"
                        name="Ganhos"
                        fill="hsl(var(--success))"
                        radius={[4, 4, 0, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum dado mensal disponível para exibição.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Distribuição por Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resultData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {resultData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="cursor-pointer"
                          onClick={() => entry.value > 0 && handleResultClick(entry.resultKey)}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">ROI por Mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar
                      dataKey="roi"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      cursor="pointer"
                      onClick={(data) => {
                        const marketKey = (data?.payload as { key?: string })?.key;
                        if (marketKey) {
                          handleMarketClick(marketKey);
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {filteredStats && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card
                className="border-success/50 bg-success/5 cursor-pointer transition-colors hover:bg-success/10"
                onClick={hasBestMarketData && bestMarketKey ? () => handleMarketClick(bestMarketKey) : undefined}
              >
                <CardHeader>
                  <CardTitle className="text-success">🎯 Melhor Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasBestMarketData && bestMarketKey && bestMarketData ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{bestMarketKey}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>Win Rate: {bestMarketData.win_rate}%</p>
                        <p>ROI: {bestMarketData.roi.toFixed(2)}%</p>
                        <p>Lucro: R$ {bestMarketData.total_profit.toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Ainda não há um melhor mercado neste período.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card
                className="border-destructive/50 bg-destructive/5 cursor-pointer transition-colors hover:bg-destructive/10"
                onClick={hasWorstMarketData && worstMarketKey ? () => handleMarketClick(worstMarketKey) : undefined}
              >
                <CardHeader>
                  <CardTitle className="text-destructive">⚠️ Pior Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasWorstMarketData && worstMarketKey && worstMarketData ? (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{worstMarketKey}</p>
                      <div className="text-sm text-muted-foreground">
                        <p>Win Rate: {worstMarketData.win_rate}%</p>
                        <p>ROI: {worstMarketData.roi.toFixed(2)}%</p>
                        <p>
                          Lucro: R${" "}
                          {worstMarketData.total_profit.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Ainda não há um pior mercado neste período.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
