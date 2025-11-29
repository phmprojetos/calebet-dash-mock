import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, ChevronRight, Trophy, Zap, Search, X, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEvents } from "@/hooks/useFixturesSearch";
import { EventItem } from "@/services/fixturesService";
import { Skeleton } from "@/components/ui/skeleton";

// Utility functions
function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekdayShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase()
    .slice(0, 3);
}

function getDayOfMonth(date: Date) {
  return date.getDate();
}

function getMonthShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}

export default function Eventos() {
  const todayKey = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Buscar eventos da API
  const { events, isLoading, isFetching, isError, refetch } = useEvents({
    date: selectedDate,
    limit: 50, // Buscar mais eventos para ter variedade
  });

  const dias = useMemo(() => {
    return Array.from({ length: 14 }).map((_, index) => {
      const currentDate = addDays(new Date(), index);
      return {
        key: formatDateKey(currentDate),
        weekday: getWeekdayShort(currentDate),
        day: getDayOfMonth(currentDate),
        month: getMonthShort(currentDate),
        isToday: index === 0,
        isTomorrow: index === 1,
      };
    });
  }, []);

  // Extrair lista única de competições dos eventos
  const competicoes = useMemo(() => {
    const unique = new Set<string>();
    events.forEach((evento) => {
      const key = `${evento.league_country} - ${evento.league}`;
      unique.add(key);
    });
    return Array.from(unique).sort();
  }, [events]);

  const eventosFiltrados = useMemo(() => {
    let filtered = [...events];

    // Filtro por competição
    if (selectedCompetition !== "all") {
      filtered = filtered.filter((evento) => {
        const key = `${evento.league_country} - ${evento.league}`;
        return key === selectedCompetition;
      });
    }

    // Filtro por pesquisa (busca em times, liga, país)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((evento) => {
        const homeTeam = evento.home_team.toLowerCase();
        const awayTeam = evento.away_team.toLowerCase();
        const league = evento.league.toLowerCase();
        const leagueCountry = evento.league_country.toLowerCase();
        const fullEvent = `${evento.home_team} x ${evento.away_team}`.toLowerCase();

        return (
          homeTeam.includes(query) ||
          awayTeam.includes(query) ||
          league.includes(query) ||
          leagueCountry.includes(query) ||
          fullEvent.includes(query)
        );
      });
    }

    return filtered.sort((a, b) => {
      // Live games first
      if (a.is_live && !b.is_live) return -1;
      if (!a.is_live && b.is_live) return 1;
      return a.time.localeCompare(b.time);
    });
  }, [events, selectedCompetition, searchQuery]);

  // Group events by league
  const eventosPorLiga = useMemo(() => {
    const grouped: Record<string, EventItem[]> = {};
    eventosFiltrados.forEach((evento) => {
      const key = `${evento.league_country} - ${evento.league}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(evento);
    });
    return grouped;
  }, [eventosFiltrados]);

  const handleRegistrarAposta = (evento: EventItem) => {
    const eventName = `${evento.home_team} x ${evento.away_team}`;
    navigate(`/bets?event=${encodeURIComponent(eventName)}`);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            Eventos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Jogos de futebol disponíveis para apostar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")} />
            Atualizar
          </Button>
          <Badge variant="outline" className="gap-1.5 w-fit">
            <Zap className="h-3 w-3 text-primary flex-shrink-0" />
            <span className="whitespace-nowrap">
              {eventosFiltrados.filter((e) => e.is_live).length} ao vivo
            </span>
            {eventosFiltrados.length > 0 && (
              <span className="text-muted-foreground hidden sm:inline">
                {" "}• {eventosFiltrados.length} {eventosFiltrados.length === 1 ? "jogo" : "jogos"}
              </span>
            )}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por time, liga ou país..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Competition Filter */}
          <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Todas as competições" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as competições</SelectItem>
              {competicoes.map((comp) => (
                <SelectItem key={comp} value={comp}>
                  {comp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Indicator */}
        {(searchQuery || selectedCompetition !== "all") && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs text-muted-foreground">Filtros ativos:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                <span className="truncate max-w-[120px] sm:max-w-none">Pesquisa: "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-0.5 hover:text-destructive flex-shrink-0"
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </Badge>
            )}
            {selectedCompetition !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                <span className="truncate max-w-[100px] sm:max-w-none">{selectedCompetition}</span>
                <button
                  onClick={() => setSelectedCompetition("all")}
                  className="ml-0.5 hover:text-destructive flex-shrink-0"
                >
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] sm:text-xs px-1.5 sm:px-2"
              onClick={() => {
                setSearchQuery("");
                setSelectedCompetition("all");
              }}
            >
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Calendar Strip - Compact SofaScore style */}
      <Card className="p-1.5 sm:p-2 bg-card">
        <ScrollArea className="w-full">
          <div className="flex gap-1 pb-1">
            {dias.map((dia) => {
              const isSelected = selectedDate === dia.key;

              return (
                <button
                  key={dia.key}
                  onClick={() => setSelectedDate(dia.key)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg transition-all min-w-[44px] sm:min-w-[48px] py-1.5 sm:py-2 px-1.5 sm:px-2 flex-shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  )}
                >
                  <span className="text-[9px] sm:text-[10px] font-medium opacity-80 leading-tight">
                    {dia.isToday ? "HOJE" : dia.isTomorrow ? "AMANHÃ" : dia.weekday}
                  </span>
                  <span className="text-base sm:text-lg font-bold leading-tight">{dia.day}</span>
                  <span className="text-[8px] sm:text-[9px] opacity-60 leading-tight">{dia.month}</span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border-b border-border">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="p-3 space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-4">
                      <Skeleton className="w-16 h-6" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full max-w-[200px]" />
                        <Skeleton className="h-4 w-full max-w-[180px]" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="w-14 h-10" />
                        <Skeleton className="w-14 h-10" />
                        <Skeleton className="w-14 h-10" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  Erro ao carregar eventos
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Não foi possível carregar os jogos. Tente novamente.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="mt-3"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Card>
        ) : Object.keys(eventosPorLiga).length === 0 ? (
          <Card className="p-6 sm:p-8 text-center">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {searchQuery || selectedCompetition !== "all"
                    ? "Nenhum jogo encontrado"
                    : "Nenhum jogo nesta data"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 px-2">
                  {searchQuery || selectedCompetition !== "all" ? (
                    <>
                      Tente ajustar os filtros ou{" "}
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCompetition("all");
                        }}
                        className="text-primary hover:underline font-medium"
                      >
                        limpar os filtros
                      </button>
                    </>
                  ) : (
                    "Selecione outra data no calendário"
                  )}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          Object.entries(eventosPorLiga).map(([liga, eventos]) => (
            <Card key={liga} className="overflow-hidden">
              {/* League Header */}
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary/50 border-b border-border">
                {eventos[0]?.league_logo ? (
                  <img
                    src={eventos[0].league_logo}
                    alt={eventos[0].league}
                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-background flex items-center justify-center text-[10px] sm:text-xs flex-shrink-0">
                    ⚽
                  </div>
                )}
                <span className="text-[11px] sm:text-xs font-medium text-foreground truncate flex-1">
                  {liga}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto flex-shrink-0">
                  {eventos.length} {eventos.length === 1 ? "jogo" : "jogos"}
                </span>
              </div>

              {/* Events */}
              <div className="divide-y divide-border">
                {eventos.map((evento) => (
                  <div
                    key={evento.id}
                    className={cn(
                      "p-2.5 sm:p-3 transition-colors hover:bg-secondary/30",
                      evento.is_live && "bg-primary/5"
                    )}
                  >
                    {/* Mobile Layout */}
                    <div className="block md:hidden space-y-2.5">
                      {/* Time / Live Badge */}
                      <div className="flex items-center justify-between">
                        {evento.is_live ? (
                          <Badge variant="destructive" className="gap-1 text-[10px] px-2 py-0.5 animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-white" />
                            LIVE
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="text-[11px] font-medium">{evento.time}</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-2 text-primary"
                          onClick={() => handleRegistrarAposta(evento)}
                        >
                          Apostar
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>

                      {/* Teams */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {evento.home_team_logo ? (
                            <img
                              src={evento.home_team_logo}
                              alt={evento.home_team}
                              className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] sm:text-[10px] font-bold flex-shrink-0">
                              {evento.home_team_short.slice(0, 2)}
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-medium text-foreground truncate flex-1">
                            {evento.home_team}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {evento.away_team_logo ? (
                            <img
                              src={evento.away_team_logo}
                              alt={evento.away_team}
                              className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] sm:text-[10px] font-bold flex-shrink-0">
                              {evento.away_team_short.slice(0, 2)}
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-medium text-foreground truncate flex-1">
                            {evento.away_team}
                          </span>
                        </div>
                      </div>

                      {/* Odds */}
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                        {[
                          { label: "1", value: evento.home_odd },
                          { label: "X", value: evento.draw_odd },
                          { label: "2", value: evento.away_odd },
                        ].map((odd) => (
                          <button
                            key={odd.label}
                            className="flex flex-col items-center justify-center py-1.5 sm:py-2 rounded-md sm:rounded-lg bg-secondary/80 hover:bg-primary/20 active:bg-primary/30 transition-colors border border-transparent hover:border-primary/30"
                          >
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                              {odd.label}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              {odd.value ? odd.value.toFixed(2) : "-"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-4">
                      {/* Time */}
                      <div className="w-16 flex-shrink-0">
                        {evento.is_live ? (
                          <Badge variant="destructive" className="gap-1 text-xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            LIVE
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-sm font-medium">{evento.time}</span>
                          </div>
                        )}
                      </div>

                      {/* Teams */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-6">
                          {/* Home Team */}
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-sm font-medium text-foreground truncate">
                              {evento.home_team}
                            </span>
                            {evento.home_team_logo ? (
                              <img
                                src={evento.home_team_logo}
                                alt={evento.home_team}
                                className="w-7 h-7 object-contain flex-shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {evento.home_team_short.slice(0, 2)}
                              </div>
                            )}
                          </div>

                          {/* VS */}
                          <span className="text-xs text-muted-foreground px-2">vs</span>

                          {/* Away Team */}
                          <div className="flex items-center gap-2 flex-1">
                            {evento.away_team_logo ? (
                              <img
                                src={evento.away_team_logo}
                                alt={evento.away_team}
                                className="w-7 h-7 object-contain flex-shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {evento.away_team_short.slice(0, 2)}
                              </div>
                            )}
                            <span className="text-sm font-medium text-foreground truncate">
                              {evento.away_team}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Odds */}
                      <div className="flex items-center gap-2">
                        {[
                          { label: "1", value: evento.home_odd },
                          { label: "X", value: evento.draw_odd },
                          { label: "2", value: evento.away_odd },
                        ].map((odd) => (
                          <button
                            key={odd.label}
                            className="flex flex-col items-center justify-center w-14 py-1.5 rounded-lg bg-secondary/80 hover:bg-primary/20 transition-colors border border-transparent hover:border-primary/30"
                          >
                            <span className="text-[10px] text-muted-foreground">
                              {odd.label}
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {odd.value ? odd.value.toFixed(2) : "-"}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Action */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleRegistrarAposta(evento)}
                      >
                        Registrar
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Loading indicator for refetch */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
          <span className="text-xs text-muted-foreground">Atualizando...</span>
        </div>
      )}
    </div>
  );
}
