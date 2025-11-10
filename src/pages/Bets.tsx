import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Bet } from "@/lib/mockData";
import { useBets } from "@/hooks/useBets";
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
import { Skeleton } from "@/components/ui/skeleton";
import { BetDialog } from "@/components/BetDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DateRangeFilter, type DateRangePeriod } from "@/components/DateRangeFilter";
import { getDateRange } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Bets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [betToDelete, setBetToDelete] = useState<Bet | undefined>();
  const initialRange = useMemo(() => getDateRange("30days"), []);
  const [startDate, setStartDate] = useState<Date>(initialRange.start);
  const [endDate, setEndDate] = useState<Date>(initialRange.end);
  const [selectedPeriod, setSelectedPeriod] = useState<DateRangePeriod>("30days");
  const [resultFilter, setResultFilter] = useState<Bet["result"] | "all">("all");

  const { bets, isLoading, createBet, updateBet, deleteBet, isDeleting } = useBets();

  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
      const createdAt = new Date(bet.created_at);
      const isWithinRange = createdAt >= startDate && createdAt <= endDate;
      const matchesResult = resultFilter === "all" || bet.result === resultFilter;

      return isWithinRange && matchesResult;
    });
  }, [bets, endDate, resultFilter, startDate]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(new Date(start));
    setEndDate(new Date(end));
  };

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

  const handleDelete = (bet: Bet) => {
    setBetToDelete(bet);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!betToDelete) return;

    deleteBet(betToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setBetToDelete(undefined);
      },
    });
  };

  const handleEdit = (bet: Bet) => {
    setEditingBet(bet);
    setDialogOpen(true);
  };

  const handleSave = (bet: Bet) => {
    if (editingBet) {
      updateBet({
        betId: bet.id,
        data: {
          event: bet.event,
          market: bet.market,
          odd: bet.odd,
          stake: bet.stake,
          result: bet.result,
          profit: bet.profit,
        },
      });
    } else {
      createBet({
        event: bet.event,
        market: bet.market,
        odd: bet.odd,
        stake: bet.stake,
        result: bet.result,
        profit: bet.profit,
        created_at: bet.created_at,
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

      <div className="space-y-4">
        <DateRangeFilter
          onRangeChange={handleDateRangeChange}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        <div className="flex flex-wrap items-center justify-end gap-3 md:justify-start">
          <Label htmlFor="result-filter" className="text-sm font-medium">
            Resultado
          </Label>
          <Select
            value={resultFilter}
            onValueChange={(value) => setResultFilter(value as Bet["result"] | "all")}
          >
            <SelectTrigger id="result-filter" className="w-[220px]">
              <SelectValue placeholder="Todos os resultados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="win">Vitória</SelectItem>
              <SelectItem value="loss">Derrota</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="void">Void</SelectItem>
              <SelectItem value="cashout">Cashout</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(9)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredBets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Nenhuma aposta encontrada para os filtros selecionados. Ajuste os filtros ou
                  clique em "Nova Aposta" para adicionar uma nova entrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredBets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell className="font-mono text-sm">{bet.id}</TableCell>
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
                      onClick={() => handleDelete(bet)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
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

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setBetToDelete(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir aposta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aposta
              {betToDelete?.event ? ` "${betToDelete.event}"` : ""}? Essa ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
