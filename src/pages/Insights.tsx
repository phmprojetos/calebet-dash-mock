import { useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockInsights, generateRandomInsight } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function Insights() {
  const [insights, setInsights] = useState(mockInsights);

  const handleGenerateNew = () => {
    const newInsight = {
      ...generateRandomInsight(),
      id: Date.now(),
    };
    setInsights([newInsight, ...insights.slice(0, 4)]);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights da IA</h1>
          <p className="text-muted-foreground">
            Análises automáticas das suas apostas com sugestões personalizadas
          </p>
        </div>
        <Button onClick={handleGenerateNew}>
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Novas Sugestões
        </Button>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className={cn(getInsightColor(insight.type))}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Lightbulb className={cn("h-6 w-6", getIconColor(insight.type))} />
                <span>Insight Automático</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed">{insight.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">💡 Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
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
