import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, TrendingUp, Target, DollarSign } from "lucide-react";
import { Bet } from "@/lib/mockData";
import { useBets } from "@/hooks/useBets";
import { toast } from "@/components/ui/sonner";
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
import { filterBetsByDateRange, getDateRange } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

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
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingConfirmationBet, setPendingConfirmationBet] = useState<Bet | undefined>();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const isInitializing = useRef(true);
  const isSyncingFromUrl = useRef(false);
  const lastSyncedSearch = useRef<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { bets, isLoading, createBetAsync, updateBet, deleteBet, isDeleting, isCreating } =
    useBets();

  const sortedBets = useMemo(
    () =>
      [...bets].sort(
        (first, second) =>
          new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
      ),
    [bets],
  );

  const last30DaysBets = useMemo(
    () => filterBetsByDateRange(sortedBets, initialRange.start, initialRange.end),
    [initialRange.end, initialRange.start, sortedBets],
  );

  const markets = useMemo(() => {
    const uniqueMarkets = new Set(
      sortedBets
        .map((bet) => bet.market?.trim())
        .filter((market): market is string => Boolean(market)),
    );

    if (marketFilter !== "all" && marketFilter.trim()) {
      uniqueMarkets.add(marketFilter.trim());
    }

    return Array.from(uniqueMarkets).sort((a, b) => a.localeCompare(b));
  }, [marketFilter, sortedBets]);

  const filteredBets = useMemo(() => {
    return sortedBets.filter((bet) => {
      const createdAt = new Date(bet.created_at);
      const isWithinRange = createdAt >= startDate && createdAt <= endDate;
      const matchesResult = resultFilter === "all" || bet.result === resultFilter;
      const matchesMarket = marketFilter === "all" || bet.market === marketFilter;

      return isWithinRange && matchesResult && matchesMarket;
    });
  }, [endDate, marketFilter, resultFilter, sortedBets, startDate]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(new Date(start));
    setEndDate(new Date(end));
  };

  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (searchParamsString === lastSyncedSearch.current) {
      isInitializing.current = false;
      return;
    }

    isSyncingFromUrl.current = true;

    const params = new URLSearchParams(searchParamsString);
    const periodParam = params.get("period") as DateRangePeriod | null;
    const startParam = params.get("start");
    const endParam = params.get("end");
    const resultParam = params.get("result");
    const marketParam = params.get("market");

    const allowedPeriods: DateRangePeriod[] = ["today", "7days", "30days", "all", "custom"];

    if (periodParam && allowedPeriods.includes(periodParam)) {
      setSelectedPeriod((current) => (current !== periodParam ? periodParam : current));

      if (periodParam === "custom") {
        if (startParam && endParam) {
          const start = new Date(startParam);
          const end = new Date(endParam);
          if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            setStartDate((current) =>
              current.getTime() !== start.getTime() ? start : current
            );
            setEndDate((current) => (current.getTime() !== end.getTime() ? end : current));
          }
        }
      } else {
        const range = getDateRange(periodParam);
        setStartDate((current) =>
          current.getTime() !== range.start.getTime() ? range.start : current
        );
        setEndDate((current) =>
          current.getTime() !== range.end.getTime() ? range.end : current
        );
      }
    }

    if (resultParam) {
      const allowedResults: Array<Bet["result"] | "all"> = [
        "all",
        "win",
        "loss",
        "pending",
        "void",
        "cashout",
      ];
      if (allowedResults.includes(resultParam as Bet["result"] | "all")) {
        setResultFilter((current) =>
          current !== resultParam ? (resultParam as Bet["result"] | "all") : current
        );
      }
    } else {
      setResultFilter((current) => (current !== "all" ? "all" : current));
    }

    if (marketParam?.trim()) {
      setMarketFilter((current) => (current !== marketParam ? marketParam : current));
    } else {
      setMarketFilter((current) => (current !== "all" ? "all" : current));
    }

    lastSyncedSearch.current = searchParamsString;
    isInitializing.current = false;

    setTimeout(() => {
      isSyncingFromUrl.current = false;
    }, 0);
  }, [searchParamsString]);

  useEffect(() => {
    if (isInitializing.current || isSyncingFromUrl.current) {
      return;
    }

    const params = new URLSearchParams();
    params.set("period", selectedPeriod);

    if (selectedPeriod === "custom") {
      params.set("start", startDate.toISOString());
      params.set("end", endDate.toISOString());
    }

    if (resultFilter !== "all") {
      params.set("result", resultFilter);
    }

    if (marketFilter !== "all") {
      params.set("market", marketFilter);
    }

    const newSearch = params.toString();
    const currentSearch = searchParamsString;

    if (newSearch !== currentSearch) {
      lastSyncedSearch.current = newSearch;
      setSearchParams(params, { replace: true });
    }
  }, [
    endDate,
    marketFilter,
    resultFilter,
    searchParamsString,
    selectedPeriod,
    setSearchParams,
    startDate,
  ]);

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
      setPendingConfirmationBet(bet);
      setConfirmationDialogOpen(true);
    }
    setEditingBet(undefined);
    setDialogOpen(false);
  };

  const handleConfirmCreate = async () => {
    if (!pendingConfirmationBet) return;

    try {
      await toast.promise(
        createBetAsync({
          event: pendingConfirmationBet.event,
          market: pendingConfirmationBet.market,
          odd: pendingConfirmationBet.odd,
          stake: pendingConfirmationBet.stake,
          result: pendingConfirmationBet.result,
          profit: pendingConfirmationBet.profit,
          created_at: pendingConfirmationBet.created_at,
        }),
        {
          loading: "Confirmando aposta...",
          success: pendingConfirmationBet.event?.trim()
            ? `Aposta em "${pendingConfirmationBet.event}" criada com sucesso.`
            : "Aposta criada com sucesso.",
          error: "Não foi possível criar a aposta. Tente novamente.",
        },
      );

      navigate("/bets", { replace: true });
      setConfirmationDialogOpen(false);
      setPendingConfirmationBet(undefined);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Minhas Apostas</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie todas as suas apostas</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            Exibindo {last30DaysBets.length} apostas registradas nos últimos 30 dias por padrão.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Aposta
        </Button>
      </div>

      <div className="space-y-4">
        <DateRangeFilter
          onRangeChange={handleDateRangeChange}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          customRange={selectedPeriod === "custom" ? { startDate, endDate } : undefined}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="result-filter" className="text-xs sm:text-sm font-medium">
              Resultado
            </Label>
            <Select
              value={resultFilter}
              onValueChange={(value) => setResultFilter(value as Bet["result"] | "all")}
            >
              <SelectTrigger id="result-filter" className="w-full">
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

          <div className="space-y-1.5">
            <Label htmlFor="market-filter" className="text-xs sm:text-sm font-medium">
              Mercado
            </Label>
            <Select
              value={marketFilter}
              onValueChange={(value) => setMarketFilter(value.trim() ? value : "all")}
            >
              <SelectTrigger id="market-filter" className="w-full">
                <SelectValue placeholder="Todos os mercados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {markets.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredBets.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma aposta encontrada para os filtros selecionados. Ajuste os filtros ou
                clique em "Nova Aposta" para adicionar uma nova entrada.
              </CardContent>
            </Card>
          ) : (
            filteredBets.map((bet) => (
              <Card key={bet.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Header com evento e resultado */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight truncate">
                        {bet.event}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {bet.market}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getResultBadge(bet.result)}
                    </div>
                  </div>

                  {/* Grid com métricas */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Odd</span>
                      <span className="text-sm font-semibold">{bet.odd.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                      <Target className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Stake</span>
                      <span className="text-sm font-semibold">R${bet.stake}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Lucro</span>
                      <span
                        className={`text-sm font-semibold ${
                          bet.profit >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {bet.profit >= 0 ? "+" : ""}
                        {bet.profit.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-md">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Data</span>
                      <span className="text-sm font-semibold">
                        {new Date(bet.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Footer com ID e ações */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-mono text-xs text-muted-foreground">
                      {bet.id}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleEdit(bet)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(bet)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="rounded-md border border-border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-sm">ID</TableHead>
                <TableHead className="text-xs md:text-sm min-w-[150px]">Evento</TableHead>
                <TableHead className="text-xs md:text-sm min-w-[120px]">Mercado</TableHead>
                <TableHead className="text-xs md:text-sm">Odd</TableHead>
                <TableHead className="text-xs md:text-sm">Stake</TableHead>
                <TableHead className="text-xs md:text-sm">Resultado</TableHead>
                <TableHead className="text-xs md:text-sm">Lucro</TableHead>
                <TableHead className="text-xs md:text-sm">Data</TableHead>
                <TableHead className="text-right text-xs md:text-sm">Ações</TableHead>
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
      )}

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
        open={confirmationDialogOpen}
        onOpenChange={(open) => {
          setConfirmationDialogOpen(open);
          if (!open) setPendingConfirmationBet(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar aposta</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme os detalhes antes de registrar a aposta.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Evento</span>
              <span className="font-medium text-right">{pendingConfirmationBet?.event}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mercado</span>
              <span className="font-medium text-right">{pendingConfirmationBet?.market}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Odd</span>
              <span className="font-semibold">{pendingConfirmationBet?.odd.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stake</span>
              <span className="font-semibold">
                R$ {pendingConfirmationBet?.stake.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Resultado</span>
              <span className="font-semibold capitalize">{pendingConfirmationBet?.result}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lucro</span>
              <span
                className={
                  (pendingConfirmationBet?.profit ?? 0) >= 0
                    ? "font-semibold text-success"
                    : "font-semibold text-destructive"
                }
              >
                R$ {pendingConfirmationBet?.profit.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Data</span>
              <span className="font-medium">
                {pendingConfirmationBet
                  ? new Date(pendingConfirmationBet.created_at).toLocaleDateString("pt-BR")
                  : ""}
              </span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCreate} disabled={isCreating}>
              {isCreating ? "Confirmando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
