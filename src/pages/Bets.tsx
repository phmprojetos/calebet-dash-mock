import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { mockBets, Bet } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BetDialog } from "@/components/BetDialog";

export default function Bets() {
  const [bets, setBets] = useState<Bet[]>(mockBets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | undefined>();
  const { toast } = useToast();

  const getResultBadge = (result: Bet["result"]) => {
    const variants = {
      win: "default",
      loss: "destructive",
      pending: "secondary",
      void: "outline",
      cashout: "secondary",
    } as const;

    return (
      <Badge variant={variants[result]} className="capitalize">
        {result === "win" ? "Vitória" : result === "loss" ? "Derrota" : result}
      </Badge>
    );
  };

  const handleDelete = (ordem_id: string) => {
    setBets(bets.filter((bet) => bet.ordem_id !== ordem_id));
    toast({
      title: "Aposta excluída",
      description: "A aposta foi removida com sucesso.",
    });
  };

  const handleEdit = (bet: Bet) => {
    setEditingBet(bet);
    setDialogOpen(true);
  };

  const handleSave = (bet: Bet) => {
    if (editingBet) {
      setBets(bets.map((b) => (b.ordem_id === bet.ordem_id ? bet : b)));
      toast({
        title: "Aposta atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } else {
      setBets([bet, ...bets]);
      toast({
        title: "Aposta criada",
        description: "A nova aposta foi adicionada com sucesso.",
      });
    }
    setEditingBet(undefined);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Apostas</h1>
          <p className="text-muted-foreground">Gerencie todas as suas apostas</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Aposta
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Mercado</TableHead>
              <TableHead>Odd</TableHead>
              <TableHead>Stake</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bets.map((bet) => (
              <TableRow key={bet.ordem_id}>
                <TableCell className="font-mono text-sm">{bet.ordem_id}</TableCell>
                <TableCell className="font-medium">{bet.event}</TableCell>
                <TableCell>{bet.market}</TableCell>
                <TableCell>{bet.odd.toFixed(2)}</TableCell>
                <TableCell>R$ {bet.stake}</TableCell>
                <TableCell>{getResultBadge(bet.result)}</TableCell>
                <TableCell>
                  <span
                    className={
                      bet.profit >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"
                    }
                  >
                    R$ {bet.profit.toLocaleString("pt-BR")}
                  </span>
                </TableCell>
                <TableCell>{new Date(bet.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(bet)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(bet.ordem_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BetDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingBet(undefined);
        }}
        bet={editingBet}
        onSave={handleSave}
      />
    </div>
  );
}
