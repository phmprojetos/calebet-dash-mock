import { Lightbulb, Sparkles, Loader2, TrendingUp, TrendingDown, AlertTriangle, Info, Target, BarChart3 } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

export default function Insights() {
  const { user } = useAuth();
  const { data: insights, isLoading, isError, refetch, isRefetching } = useInsights();
  const queryClient = useQueryClient();

  const handleGenerateNew = () => {
    // Força refresh dos insights
    queryClient.invalidateQueries({ queryKey: ["insights", user?.id || ""] });
    refetch();
  };

  const getInsightConfig = (type: string) => {
    switch (type) {
      case "success":
        return {
          border: "border-green-500/50",
          bg: "bg-green-500/5",
          icon: TrendingUp,
          iconColor: "text-green-500",
          badge: "default",
        };
      case "warning":
        return {
          border: "border-yellow-500/50",
          bg: "bg-yellow-500/5",
          icon: AlertTriangle,
          iconColor: "text-yellow-500",
          badge: "secondary",
        };
      case "danger":
        return {
          border: "border-red-500/50",
          bg: "bg-red-500/5",
          icon: TrendingDown,
          iconColor: "text-red-500",
          badge: "destructive",
        };
      case "info":
      default:
        return {
          border: "border-blue-500/50",
          bg: "bg-blue-500/5",
          icon: Info,
          iconColor: "text-blue-500",
          badge: "outline",
        };
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Insights da IA</h1>
          <p className="text-destructive mt-2">Erro ao carregar insights. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Insights da IA</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Análises inteligentes baseadas nos seus dados de apostas
          </p>
        </div>
        <Button onClick={handleGenerateNew} disabled={isRefetching} className="w-full md:w-auto">
          {isRefetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Atualizar Análise
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => {
            const config = getInsightConfig(insight.type);
            const Icon = config.icon;

            return (
              <Card
                key={insight.id}
                className={cn("transition-all hover:shadow-md", config.border, config.bg)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn("p-2 rounded-lg bg-background", config.bg)}>
                        <Icon className={cn("h-5 w-5", config.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg mb-1">
                          {insight.title}
                        </CardTitle>
                        {insight.market && (
                          <Badge variant={config.badge as any} className="mt-1">
                            {insight.market}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm md:text-base leading-relaxed text-foreground">
                    {insight.message}
                  </p>

                  {/* Métricas */}
                  {insight.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {insight.metrics.roi !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              insight.metrics.roi >= 0 ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {insight.metrics.roi >= 0 ? "+" : ""}
                            {insight.metrics.roi.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {insight.metrics.winRate !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Taxa de Acerto</p>
                          <p className="text-sm font-semibold text-foreground">
                            {insight.metrics.winRate.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {insight.metrics.totalProfit !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Lucro/Prejuízo</p>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              insight.metrics.totalProfit >= 0 ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {insight.metrics.totalProfit >= 0 ? "+" : ""}R${" "}
                            {Math.abs(insight.metrics.totalProfit).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {insight.metrics.totalBets !== undefined && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Total de Apostas</p>
                          <p className="text-sm font-semibold text-foreground">
                            {insight.metrics.totalBets}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recomendação */}
                  {insight.recommendation && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2 pt-2">
                        <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-1">
                            Recomendação:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Nenhum insight disponível
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você ainda não tem apostas suficientes para análise. Comece a apostar para receber insights personalizados!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm md:text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Como funciona?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs md:text-sm text-muted-foreground">
          <p>
            Nossa IA analisa continuamente suas apostas e identifica padrões de sucesso e áreas de
            melhoria baseados em dados reais.
          </p>
          <p>
            As análises incluem métricas como ROI, taxa de acerto, volatilidade e performance por mercado.
          </p>
          <p>
            <strong className="text-foreground">Dica:</strong> Foque nos mercados com ROI positivo e reavalie estratégias em
            mercados com resultados negativos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
