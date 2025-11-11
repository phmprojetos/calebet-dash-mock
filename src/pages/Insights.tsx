import { Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { DEMO_USER_ID } from "@/lib/api";

export default function Insights() {
  const { data: insights, isLoading, isError, refetch, isRefetching } = useInsights();
  const queryClient = useQueryClient();

  const handleGenerateNew = () => {
    // Força refresh dos insights
    queryClient.invalidateQueries({ queryKey: ["insights", DEMO_USER_ID] });
    refetch();
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-success/50 bg-success/5";
      case "warning":
        return "border-warning/50 bg-warning/5";
      case "info":
        return "border-info/50 bg-info/5";
      default:
        return "";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "info":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights da IA</h1>
          <p className="text-destructive">Erro ao carregar insights. Tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Insights da IA</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Análises automáticas das suas apostas com sugestões personalizadas
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
              Gerar Novas Sugestões
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id} className={cn(getInsightColor(insight.type))}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                  <Lightbulb className={cn("h-5 w-5 md:h-6 md:w-6", getIconColor(insight.type))} />
                  <span>Insight Automático</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base leading-relaxed">{insight.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum insight disponível no momento. Clique em "Gerar Novas Sugestões" para analisar suas apostas.
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm md:text-base">💡 Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs md:text-sm text-muted-foreground">
          <p>
            Nossa IA analisa continuamente suas apostas e identifica padrões de sucesso e áreas de
            melhoria.
          </p>
          <p>
            As sugestões são baseadas em métricas como ROI, win rate e performance por mercado.
          </p>
          <p>
            <strong>Dica:</strong> Foque nos mercados com ROI positivo e reavalie estratégias em
            mercados com resultados negativos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
