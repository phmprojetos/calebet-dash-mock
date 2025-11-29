import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface CreditCardCheckoutProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreditCardCheckout({
  plan,
  onClose,
  onSuccess,
}: CreditCardCheckoutProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    installments: "1",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatCVV = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simular processamento do pagamento
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Pagamento processado! Seu plano foi ativado.");
      onSuccess();
    }, 2000);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary */}
      <Card className="bg-secondary/50">
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plano</span>
              <span className="font-medium text-foreground truncate ml-2">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor mensal</span>
              <span className="font-medium text-foreground">
                R$ {plan.price.toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-lg text-foreground">
                  R$ {plan.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Form */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                Pagamento seguro e criptografado
              </span>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="text-xs sm:text-sm">Número do Cartão</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  className="pl-9 sm:pl-10 text-sm"
                  maxLength={19}
                  required
                />
              </div>
            </div>

            {/* Card Name */}
            <div className="space-y-2">
              <Label htmlFor="cardName" className="text-xs sm:text-sm">Nome no Cartão</Label>
              <Input
                id="cardName"
                placeholder="Nome completo"
                value={formData.cardName}
                onChange={(e) =>
                  setFormData({ ...formData, cardName: e.target.value })
                }
                className="text-sm"
                required
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth" className="text-xs sm:text-sm">Mês</Label>
                <Select
                  value={formData.expiryMonth}
                  onValueChange={(value) =>
                    setFormData({ ...formData, expiryMonth: value })
                  }
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                        {month.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear" className="text-xs sm:text-sm">Ano</Label>
                <Select
                  value={formData.expiryYear}
                  onValueChange={(value) =>
                    setFormData({ ...formData, expiryYear: value })
                  }
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="AA" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString().slice(-2)}>
                        {year.toString().slice(-2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-xs sm:text-sm">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cvv: formatCVV(e.target.value),
                    })
                  }
                  className="text-sm"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            {/* Installments */}
            <div className="space-y-2">
              <Label htmlFor="installments" className="text-xs sm:text-sm">Parcelas</Label>
              <Select
                value={formData.installments}
                onValueChange={(value) =>
                  setFormData({ ...formData, installments: value })
                }
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => {
                    const installmentValue = plan.price / num;
                    return (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x de R$ {installmentValue.toFixed(2)}{" "}
                        {num === 1 ? "(sem juros)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <div className="flex items-start gap-2 p-2 sm:p-3 bg-secondary/50 rounded-lg">
        <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Seus dados estão protegidos com criptografia SSL. Não armazenamos
          informações do cartão em nossos servidores.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1 w-full sm:w-auto" type="button">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isProcessing}
          className="flex-1 w-full sm:w-auto"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Processando...</span>
              <span className="sm:hidden">Processando</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Pagar R$ {plan.price.toFixed(2)}</span>
              <span className="sm:hidden">Pagar R$ {plan.price.toFixed(2)}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

