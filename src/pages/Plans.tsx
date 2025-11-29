import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, X, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { PixCheckout } from "@/components/PixCheckout";
import { CreditCardCheckout } from "@/components/CreditCardCheckout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PlanType = "free" | "pro";
type PaymentMethod = "pix" | "credit_card";

interface Plan {
  id: PlanType;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Grátis",
    description: "Plano básico para começar suas apostas",
    features: [
      "1 análise simples por dia",
      "Acompanhamento básico de apostas",
      "Dashboard com estatísticas básicas",
      "Suporte por email",
    ],
    limitations: [
      "Limitado a 1 análise por dia",
      "Análises básicas apenas",
      "Sem planos de ação por IA",
      "Exibição de anúncios",
    ],
  },
  {
    id: "pro",
    name: "CALEBet Pro",
    price: 49.90,
    priceLabel: "R$ 49,90/mês",
    description: "Análises avançadas e planos de ação por IA",
    popular: true,
    features: [
      "Análises ilimitadas",
      "Planos de ação personalizados por IA",
      "Análise avançada de dados",
      "Insights detalhados e previsões",
      "Dashboard completo com métricas avançadas",
      "Suporte prioritário",
      "Relatórios mensais automatizados",
      "Alertas inteligentes de oportunidades",
      "Sem anúncios",
    ],
  },
];

export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const currentPlan: PlanType = "free"; // Mock: usuário atual está no plano free

  const handleUpgrade = (planId: PlanType) => {
    if (planId === "free") return;
    setSelectedPlan(planId);
    setCheckoutOpen(true);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
    setSelectedPlan(null);
    setPaymentMethod(null);
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Planos e Pagamento
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Escolha o plano ideal para suas necessidades de apostas
        </p>
      </div>

      {/* Current Plan Badge */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plano Atual</p>
                <p className="font-semibold text-foreground">
                  {plans.find((p) => p.id === currentPlan)?.name}
                </p>
              </div>
            </div>
            <Badge variant={currentPlan === "pro" ? "default" : "secondary"}>
              {currentPlan === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          const isPro = plan.id === "pro";

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.popular && "border-primary shadow-lg",
                isCurrentPlan && "border-primary/50"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {isPro && <Crown className="h-5 w-5 text-primary" />}
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price === 0 ? plan.priceLabel : `R$ ${plan.price.toFixed(2)}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-muted-foreground">/mês</span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-4">
                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Recursos Inclusos
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations (only for Free) */}
                  {plan.limitations && plan.limitations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <X className="h-4 w-4 text-muted-foreground" />
                        Limitações
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plano Atual
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.id === "free"}
                  >
                    {plan.id === "free" ? "Plano Atual" : "Fazer Upgrade"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Comparison Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Planos</CardTitle>
          <CardDescription>
            Veja as diferenças entre os planos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Recurso
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">
                    Free
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">
                    CALEBet Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-foreground">
                    Análises por dia
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    1 simples
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-foreground">
                    Planos de ação por IA
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-foreground">
                    Análise avançada de dados
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-foreground">
                    Insights detalhados
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-foreground">
                    Suporte prioritário
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-foreground">
                    Sem anúncios
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                    <X className="h-4 w-4 text-muted-foreground mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Dialog */}
      {selectedPlanData && (
        <Dialog open={checkoutOpen} onOpenChange={handleCloseCheckout}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-4 sm:p-6">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-base sm:text-lg">Finalizar Assinatura</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Escolha a forma de pagamento para o plano {selectedPlanData.name}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0 mt-4">
            {!paymentMethod ? (
              <div className="space-y-3 py-4">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handlePaymentMethodSelect("pix")}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">🧾</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground">PIX</div>
                      <div className="text-xs text-muted-foreground">
                        Aprovação imediata
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handlePaymentMethodSelect("credit_card")}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground">Cartão de Crédito</div>
                      <div className="text-xs text-muted-foreground">
                        Pagamento recorrente mensal
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            ) : paymentMethod === "pix" ? (
              <PixCheckout
                plan={selectedPlanData}
                onClose={handleCloseCheckout}
                onSuccess={() => {
                  handleCloseCheckout();
                  // Aqui você pode atualizar o plano do usuário
                }}
              />
            ) : (
              <CreditCardCheckout
                plan={selectedPlanData}
                onClose={handleCloseCheckout}
                onSuccess={() => {
                  handleCloseCheckout();
                  // Aqui você pode atualizar o plano do usuário
                }}
              />
            )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

