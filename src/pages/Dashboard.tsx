import { TrendingUp, TrendingDown, DollarSign, Target, Percent, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { mockStats } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const resultData = [
    { name: "Vitórias", value: mockStats.by_result.win, color: "hsl(var(--success))" },
    { name: "Derrotas", value: mockStats.by_result.loss, color: "hsl(var(--destructive))" },
    { name: "Pendentes", value: mockStats.by_result.pending, color: "hsl(var(--muted))" },
  ];

  const marketData = Object.entries(mockStats.by_market).map(([name, data]) => ({
    name: name.length > 15 ? name.substring(0, 15) + "..." : name,
    roi: data.roi,
    winRate: data.win_rate,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas apostas esportivas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Apostas"
          value={mockStats.total_bets}
          icon={BarChart3}
          trend="neutral"
        />
        <StatCard
          title="Stake Total"
          value={`R$ ${mockStats.total_stake.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          trend="neutral"
        />
        <StatCard
          title="Lucro Total"
          value={`R$ ${mockStats.total_profit.toLocaleString("pt-BR")}`}
          icon={mockStats.total_profit >= 0 ? TrendingUp : TrendingDown}
          trend={mockStats.total_profit >= 0 ? "positive" : "negative"}
        />
        <StatCard
          title="Win Rate"
          value={`${mockStats.win_rate}%`}
          icon={Target}
          trend={mockStats.win_rate >= 50 ? "positive" : "negative"}
          subtitle={`${mockStats.by_result.win} vitórias / ${mockStats.by_result.loss} derrotas`}
        />
        <StatCard
          title="ROI"
          value={`${mockStats.roi.toFixed(2)}%`}
          icon={Percent}
          trend={mockStats.roi >= 0 ? "positive" : "negative"}
        />
        <StatCard
          title="Odd Média"
          value={mockStats.avg_odd.toFixed(2)}
          icon={BarChart3}
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Resultado</CardTitle>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI por Mercado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-success/50 bg-success/5">
          <CardHeader>
            <CardTitle className="text-success">🎯 Melhor Mercado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{mockStats.best_market}</p>
              <div className="text-sm text-muted-foreground">
                <p>Win Rate: {mockStats.by_market[mockStats.best_market].win_rate}%</p>
                <p>ROI: {mockStats.by_market[mockStats.best_market].roi.toFixed(2)}%</p>
                <p>Lucro: R$ {mockStats.by_market[mockStats.best_market].total_profit.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">⚠️ Pior Mercado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{mockStats.worst_market}</p>
              <div className="text-sm text-muted-foreground">
                <p>Win Rate: {mockStats.by_market[mockStats.worst_market].win_rate}%</p>
                <p>ROI: {mockStats.by_market[mockStats.worst_market].roi.toFixed(2)}%</p>
                <p>Lucro: R$ {mockStats.by_market[mockStats.worst_market].total_profit.toLocaleString("pt-BR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
