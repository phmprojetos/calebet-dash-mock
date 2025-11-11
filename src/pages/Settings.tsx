import { useState } from "react";
import { User, DollarSign, Target, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "João Silva",
    email: "joao.silva@email.com",
    bankroll: "5000",
    monthlyGoal: "1000",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie suas preferências e informações da conta</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Seus dados básicos de cadastro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs md:text-sm">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome"
                className="text-sm md:text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs md:text-sm">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                className="text-sm md:text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
              Gestão Financeira
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Configure sua banca e objetivos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="bankroll" className="text-xs md:text-sm">Banca Atual (R$)</Label>
              <Input
                id="bankroll"
                type="number"
                value={formData.bankroll}
                onChange={(e) => setFormData({ ...formData, bankroll: e.target.value })}
                placeholder="5000"
                className="text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground">
                Valor total disponível para suas apostas
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="monthlyGoal" className="flex items-center gap-2 text-xs md:text-sm">
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                Meta Mensal (R$)
              </Label>
              <Input
                id="monthlyGoal"
                type="number"
                value={formData.monthlyGoal}
                onChange={(e) => setFormData({ ...formData, monthlyGoal: e.target.value })}
                placeholder="1000"
                className="text-sm md:text-base"
              />
              <p className="text-xs text-muted-foreground">Objetivo de lucro para este mês</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>

      <Card className="border-info/50 bg-info/5">
        <CardHeader>
          <CardTitle className="text-info text-sm md:text-base">ℹ️ Sobre os Dados</CardTitle>
        </CardHeader>
        <CardContent className="text-xs md:text-sm text-muted-foreground">
          <p>
            Atualmente, todas as configurações são armazenadas localmente. Em breve, integraremos
            com o backend para sincronização em nuvem e backup automático dos seus dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
