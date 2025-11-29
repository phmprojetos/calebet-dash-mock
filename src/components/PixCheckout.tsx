import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Loader2, QrCode } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface PixCheckoutProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

// Mock PIX code generator
function generatePixCode(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "00020126";
  for (let i = 0; i < 50; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function PixCheckout({ plan, onClose, onSuccess }: PixCheckoutProps) {
  const [pixCode, setPixCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutos em segundos

  useEffect(() => {
    // Gerar código PIX mockado
    setPixCode(generatePixCode());

    // Timer de expiração
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar código");
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simular processamento
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Pagamento confirmado! Seu plano foi ativado.");
      onSuccess();
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Order Summary */}
      <Card className="bg-secondary/50">
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plano</span>
              <span className="font-medium text-foreground truncate ml-2">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor</span>
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

      {/* PIX Code */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-foreground mb-2">
                Escaneie o QR Code ou copie o código PIX
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground px-2">
                O pagamento será processado automaticamente após a confirmação
              </p>
            </div>

            {/* PIX Code Display */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Código PIX (Copiar e Colar)
              </label>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0 p-2 sm:p-3 bg-secondary rounded-lg border border-border font-mono text-[10px] sm:text-xs break-all overflow-x-auto">
                  {pixCode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                >
                  {copied ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  ) : (
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Timer */}
            {timeRemaining > 0 && (
              <div className="text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Este código expira em{" "}
                  <span className="font-semibold text-foreground">
                    {formatTime(timeRemaining)}
                  </span>
                </p>
              </div>
            )}

            {timeRemaining === 0 && (
              <div className="text-center p-3 sm:p-4 bg-destructive/10 rounded-lg">
                <p className="text-xs sm:text-sm text-destructive font-medium">
                  Código PIX expirado. Por favor, gere um novo código.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4 sm:pt-6">
          <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-2">
            Como pagar com PIX:
          </h4>
          <ol className="text-xs sm:text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Abra o app do seu banco</li>
            <li>Escolha a opção PIX</li>
            <li>Escaneie o QR Code ou cole o código copiado</li>
            <li>Confirme o pagamento</li>
            <li>Seu plano será ativado automaticamente</li>
          </ol>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1 w-full sm:w-auto">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmPayment}
          disabled={isProcessing || timeRemaining === 0}
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
              <span className="hidden sm:inline">Já paguei, confirmar</span>
              <span className="sm:hidden">Confirmar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

