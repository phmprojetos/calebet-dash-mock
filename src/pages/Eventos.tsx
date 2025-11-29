import { useMemo, useState } from "react";
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
import { Clock, ChevronRight, ChevronLeft, Trophy, Search, X, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEvents, useFixturesSearch } from "@/hooks/useFixturesSearch";
import { EventItem } from "@/services/fixturesService";
import { Skeleton } from "@/components/ui/skeleton";
import { BetDialog } from "@/components/BetDialog";
import { Bet } from "@/lib/mockData";
import { useBets } from "@/hooks/useBets";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";

// Fuso horário de Brasília
const TIMEZONE_BRASILIA = "America/Sao_Paulo";

// Obter data atual em Brasília
function getNowInBrasilia() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE_BRASILIA }));
}

// Obter horário atual em minutos (Brasília)
function getCurrentMinutesBrasilia() {
  const now = getNowInBrasilia();
  return now.getHours() * 60 + now.getMinutes();
}

// Utility functions
function formatDateKey(date: Date) {
  // Formatar data no fuso de Brasília
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE_BRASILIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekdayShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: TIMEZONE_BRASILIA })
    .format(date)
    .replace(".", "")
    .toUpperCase()
    .slice(0, 3);
}

function getDayOfMonth(date: Date) {
  return parseInt(
    new Intl.DateTimeFormat("pt-BR", { day: "numeric", timeZone: TIMEZONE_BRASILIA }).format(date)
  );
}

function getMonthShort(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: TIMEZONE_BRASILIA })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}

function getDateLabel(date: Date, index: number) {
  if (index === 0) return "Hoje";
  if (index === 1) return "Amanhã";
  return `${getDayOfMonth(date)}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

// Função para obter a prioridade de uma liga (ordem de exibição)
function getLeaguePriority(league: string, country: string): number {
  const leagueLower = league.toLowerCase();
  const countryLower = country.toLowerCase();

  // Brasileirão tem prioridade máxima
  if (
    (leagueLower.includes("brasileirão") || leagueLower.includes("brasileiro")) &&
    (countryLower.includes("brazil") || countryLower.includes("brasil"))
  ) {
    return 0;
  }

  // Serie A Brasil
  if (leagueLower.includes("serie a") && (countryLower.includes("brazil") || countryLower.includes("brasil"))) {
    return 0;
  }

  // Premier League (Inglaterra)
  if (leagueLower.includes("premier league") && (countryLower.includes("england") || countryLower.includes("inglaterra"))) {
    return 1;
  }

  // Libertadores
  if (leagueLower.includes("libertadores")) {
    return 2;
  }

  // La Liga
  if (leagueLower.includes("la liga") || leagueLower.includes("laliga")) {
    return 3;
  }

  // Bundesliga
  if (leagueLower.includes("bundesliga")) {
    return 4;
  }

  // Serie A Itália
  if (leagueLower.includes("serie a") && (countryLower.includes("italy") || countryLower.includes("itália"))) {
    return 5;
  }

  // Ligue 1
  if (leagueLower.includes("ligue 1")) {
    return 6;
  }

  // Champions League
  if (leagueLower.includes("champions")) {
    return 7;
  }

  // Europa League
  if (leagueLower.includes("europa league")) {
    return 8;
  }

  // Copa do Brasil
  if (leagueLower.includes("copa do brasil")) {
    return 9;
  }

  // Sul-Americana
  if (leagueLower.includes("sul-americana") || leagueLower.includes("sudamericana")) {
    return 10;
  }

  // Demais ligas
  return 100;
}

export default function Eventos() {
  const todayKey = formatDateKey(new Date());
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Estado do modal de aposta
  const [betDialogOpen, setBetDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // Hook para criar apostas
  const { createBetAsync } = useBets();

  // Gerar array de 5 dias
  const dias = useMemo(() => {
    return Array.from({ length: 5 }).map((_, index) => {
      const currentDate = addDays(new Date(), index);
      return {
        key: formatDateKey(currentDate),
        date: currentDate,
        label: getDateLabel(currentDate, index),
        weekday: getWeekdayShort(currentDate),
        day: getDayOfMonth(currentDate),
        month: getMonthShort(currentDate),
      };
    });
  }, []);

  const selectedDate = dias[selectedDateIndex]?.key || todayKey;

  // Debounce da pesquisa
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Buscar eventos da API (eventos do dia)
  const { events, isLoading, isFetching, isError, refetch } = useEvents({
    date: selectedDate,
    limit: 50,
  });

  // Buscar na API quando pesquisar (para encontrar eventos não listados)
  const { fixtures: searchResults, isLoading: isSearching } = useFixturesSearch({
    query: debouncedSearchQuery,
    limit: 20,
    enabled: debouncedSearchQuery.length >= 2,
  });

  // Mapeamento de league_id para nome da liga (principais)
  const leagueIdToName: Record<number, { name: string; country: string }> = {
    71: { name: "Brasileirão Série A", country: "Brasil" },
    72: { name: "Brasileirão Série B", country: "Brasil" },
    73: { name: "Copa do Brasil", country: "Brasil" },
    39: { name: "Premier League", country: "Inglaterra" },
    140: { name: "La Liga", country: "Espanha" },
    135: { name: "Serie A", country: "Itália" },
    78: { name: "Bundesliga", country: "Alemanha" },
    61: { name: "Ligue 1", country: "França" },
    2: { name: "Champions League", country: "Europa" },
    3: { name: "Europa League", country: "Europa" },
    13: { name: "Libertadores", country: "América do Sul" },
    11: { name: "Sul-Americana", country: "América do Sul" },
    94: { name: "Primeira Liga", country: "Portugal" },
    88: { name: "Eredivisie", country: "Holanda" },
    144: { name: "Jupiler Pro League", country: "Bélgica" },
  };

  // Converter resultados da busca para formato EventItem
  const searchEventsConverted: EventItem[] = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return [];
    
    return searchResults.map((fixture) => {
      const leagueInfo = leagueIdToName[fixture.league_id] || { 
        name: "Outra Liga", 
        country: "Internacional" 
      };
      
      const fixtureDate = new Date(fixture.date);
      const dateStr = fixtureDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: TIMEZONE_BRASILIA,
      });
      const timeStr = fixtureDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: TIMEZONE_BRASILIA,
      });
      
      return {
        id: `search-${fixture.id}`,
        fixture_id: fixture.id,
        date: fixture.date.split("T")[0],
        time: `${dateStr} ${timeStr}`,
        league: leagueInfo.name,
        league_country: leagueInfo.country,
        league_logo: null,
        home_team: fixture.home_team_name,
        away_team: fixture.away_team_name,
        home_team_short: fixture.home_team_name.slice(0, 3).toUpperCase(),
        away_team_short: fixture.away_team_name.slice(0, 3).toUpperCase(),
        home_team_logo: fixture.home_team_logo || null,
        away_team_logo: fixture.away_team_logo || null,
        home_odd: null,
        draw_odd: null,
        away_odd: null,
        is_live: false,
      };
    });
  }, [searchResults]);

  // Extrair lista única de competições dos eventos
  const competicoes = useMemo(() => {
    const unique = new Set<string>();
    events.forEach((evento) => {
      const key = `${evento.league_country} - ${evento.league}`;
      unique.add(key);
    });
    return Array.from(unique).sort();
  }, [events]);

  // Verificar se a data selecionada é hoje
  const isToday = selectedDateIndex === 0;

  const eventosFiltrados = useMemo(() => {
    let filtered = [...events];

    // Corrigir is_live: só pode ser true se for hoje
    filtered = filtered.map((e) => ({
      ...e,
      is_live: isToday ? e.is_live : false,
    }));

    // Filtro ao vivo (só funciona para hoje)
    if (showLiveOnly) {
      if (!isToday) {
        // Se não é hoje, não há jogos ao vivo
        filtered = [];
      } else {
        filtered = filtered.filter((e) => e.is_live);
      }
    }

    // Filtro por competição
    if (selectedCompetition !== "all") {
      filtered = filtered.filter((evento) => {
        const key = `${evento.league_country} - ${evento.league}`;
        return key === selectedCompetition;
      });
    }

    // Filtro por pesquisa local
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const localFiltered = filtered.filter((evento) => {
        const homeTeam = evento.home_team.toLowerCase();
        const awayTeam = evento.away_team.toLowerCase();
        const league = evento.league.toLowerCase();
        return homeTeam.includes(query) || awayTeam.includes(query) || league.includes(query);
      });

      // Se não encontrou localmente e temos resultados da API, usar resultados da API
      if (localFiltered.length === 0 && searchEventsConverted.length > 0) {
        filtered = searchEventsConverted;
      } else {
        filtered = localFiltered;
      }
    }

    // Ordenação por proximidade do horário atual (Brasília)
    const currentMinutes = getCurrentMinutesBrasilia();

    const parseTime = (time: string) => {
      const match = time.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      return 0;
    };

    return filtered.sort((a, b) => {
      // Jogos ao vivo têm prioridade máxima (horário = agora)
      const timeA = a.is_live ? currentMinutes : parseTime(a.time);
      const timeB = b.is_live ? currentMinutes : parseTime(b.time);

      // Calcular diferença do horário atual
      const diffA = timeA - currentMinutes;
      const diffB = timeB - currentMinutes;

      // Jogos futuros (diff >= 0) vêm antes de jogos passados (diff < 0)
      const isFutureA = diffA >= 0 || a.is_live;
      const isFutureB = diffB >= 0 || b.is_live;

      if (isFutureA && !isFutureB) return -1;
      if (!isFutureA && isFutureB) return 1;

      // Entre futuros: ordenar por mais próximo primeiro
      if (isFutureA && isFutureB) {
        return diffA - diffB;
      }

      // Entre passados: ordenar por mais recente primeiro
      return diffB - diffA;
    });
  }, [events, showLiveOnly, selectedCompetition, searchQuery, isToday, searchEventsConverted]);

  // Group events by league
  // Agrupar eventos por liga e ordenar por prioridade
  const eventosPorLiga = useMemo(() => {
    const grouped: Record<string, { eventos: EventItem[]; priority: number }> = {};
    
    eventosFiltrados.forEach((evento) => {
      const key = `${evento.league_country} - ${evento.league}`;
      if (!grouped[key]) {
        grouped[key] = {
          eventos: [],
          priority: getLeaguePriority(evento.league, evento.league_country),
        };
      }
      grouped[key].eventos.push(evento);
    });

    // Ordenar por prioridade e retornar apenas os eventos
    const sortedEntries = Object.entries(grouped)
      .sort(([, a], [, b]) => a.priority - b.priority)
      .map(([key, value]) => [key, value.eventos] as [string, EventItem[]]);

    return Object.fromEntries(sortedEntries) as Record<string, EventItem[]>;
  }, [eventosFiltrados]);

  const handleRegistrarAposta = (evento: EventItem) => {
    const eventName = `${evento.home_team} x ${evento.away_team}`;
    setSelectedEvent(eventName);
    setBetDialogOpen(true);
  };

  const handleSaveBet = async (bet: Bet) => {
    try {
      await createBetAsync({
        home_team: bet.home_team || "",
        away_team: bet.away_team || "",
        market: bet.market,
        odd: bet.odd,
        stake: bet.stake,
        source: "eventos",
        is_live: bet.is_live,
      });
      toast({
        title: "Aposta registrada!",
        description: `Aposta em "${bet.home_team} x ${bet.away_team}" criada com sucesso.`,
      });
      setBetDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível criar a aposta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Contar jogos ao vivo (só conta se for hoje)
  const liveCount = isToday ? events.filter((e) => e.is_live).length : 0;

  const handlePrevDay = () => {
    if (selectedDateIndex > 0) {
      const newIndex = selectedDateIndex - 1;
      setSelectedDateIndex(newIndex);
      // Resetar filtro ao vivo se sair de hoje
      if (newIndex !== 0) {
        setShowLiveOnly(false);
      }
    }
  };

  const handleNextDay = () => {
    if (selectedDateIndex < dias.length - 1) {
      const newIndex = selectedDateIndex + 1;
      setSelectedDateIndex(newIndex);
      // Resetar filtro ao vivo se sair de hoje
      if (newIndex !== 0) {
        setShowLiveOnly(false);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Header - Mobile */}
      {isMobile ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar time ou liga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10"
            />
            {isSearching && searchQuery.length >= 2 && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
            )}
            {searchQuery && !isSearching && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Navigation: Live + Date */}
          <div className="flex items-center gap-2">
            {/* Live Button - só habilitado para hoje */}
            <Button
              variant={showLiveOnly ? "default" : "outline"}
              size="sm"
              className={cn(
                "gap-1.5 h-9",
                showLiveOnly && "bg-destructive hover:bg-destructive/90",
                !isToday && "opacity-50"
              )}
              onClick={() => isToday && setShowLiveOnly(!showLiveOnly)}
              disabled={!isToday}
            >
              <span className={cn(
                "w-2 h-2 rounded-full",
                showLiveOnly ? "bg-white animate-pulse" : "bg-destructive",
                !isToday && "opacity-50"
              )} />
              Ao vivo
              {liveCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ml-1">
                  {liveCount}
                </Badge>
              )}
            </Button>

            {/* Date Navigation */}
            <div className="flex-1 flex items-center justify-center gap-1 bg-secondary/50 rounded-lg h-9">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevDay}
                disabled={selectedDateIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                {dias[selectedDateIndex]?.label}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNextDay}
                disabled={selectedDateIndex === dias.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Event Count */}
            <span className="text-xs text-primary font-medium whitespace-nowrap">
              {eventosFiltrados.length} jogos
            </span>
          </div>
        </>
      ) : (
        /* Header - Desktop */
        <>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Eventos</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Jogos de futebol disponíveis para apostar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
                Atualizar
              </Button>
              <Badge variant="outline" className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span>{liveCount} ao vivo</span>
                <span className="text-muted-foreground">• {eventosFiltrados.length} jogos</span>
              </Badge>
            </div>
          </div>

          {/* Calendar Strip - Desktop */}
          <Card className="p-2 bg-card">
            <ScrollArea className="w-full">
              <div className="flex gap-1 pb-1">
                {dias.map((dia, index) => {
                  const isSelected = selectedDateIndex === index;
                  return (
                    <button
                      key={dia.key}
                      onClick={() => {
                        setSelectedDateIndex(index);
                        if (index !== 0) setShowLiveOnly(false);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg transition-all min-w-[48px] py-2 px-2 flex-shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      )}
                    >
                      <span className="text-[10px] font-medium opacity-80 leading-tight">
                        {index === 0 ? "HOJE" : index === 1 ? "AMANHÃ" : dia.weekday}
                      </span>
                      <span className="text-lg font-bold leading-tight">{dia.day}</span>
                      <span className="text-[9px] opacity-60 leading-tight">{dia.month}</span>
                    </button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>

          {/* Search and Filters - Desktop */}
          <div className="flex flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por time, liga ou país..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {isSearching && searchQuery.length >= 2 && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger className="w-[240px]">
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
        </>
      )}

      {/* Events List */}
      {isMobile ? (
        /* Mobile - SofaScore Style */
        <div className="space-y-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="px-3 py-2 bg-secondary/30 border-b border-border">
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="divide-y divide-border">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex items-center gap-3 px-3 py-2">
                      <Skeleton className="w-10 h-8" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          ) : isError ? (
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Erro ao carregar</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </Card>
          ) : eventosFiltrados.length === 0 ? (
            <Card className="p-6 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {showLiveOnly ? "Nenhum jogo ao vivo" : "Nenhum jogo encontrado"}
              </p>
            </Card>
          ) : (
            Object.entries(eventosPorLiga).map(([liga, eventos]) => (
              <Card key={liga} className="overflow-hidden">
                {/* League Header - Compact */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 border-b border-border">
                  {eventos[0]?.league_logo ? (
                    <img src={eventos[0].league_logo} alt="" className="w-4 h-4 object-contain" />
                  ) : (
                    <span className="text-xs">⚽</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground">
                      {eventos[0]?.league_country}
                    </span>
                    <span className="text-xs text-muted-foreground mx-1">▸</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {eventos[0]?.league}
                    </span>
                  </div>
                </div>

                {/* Events - Compact rows */}
                <div className="divide-y divide-border">
                  {eventos.map((evento) => (
                    <div
                      key={evento.id}
                      className={cn(
                        "px-3 py-2 active:bg-secondary/50",
                        evento.is_live && "bg-primary/5"
                      )}
                      onClick={() => handleRegistrarAposta(evento)}
                    >
                      {/* Main row: Time + Teams + Arrow */}
                      <div className="flex items-center gap-2">
                        {/* Time */}
                        <div className="w-10 flex-shrink-0 text-center">
                          {evento.is_live ? (
                            <span className="text-[11px] text-destructive font-semibold animate-pulse">
                              LIVE
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium">{evento.time}</span>
                          )}
                        </div>

                        {/* Teams */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {evento.home_team_logo ? (
                              <img src={evento.home_team_logo} alt="" className="w-4 h-4 object-contain" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold">
                                {evento.home_team_short.slice(0, 1)}
                              </div>
                            )}
                            <span className="text-xs font-medium truncate">{evento.home_team}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {evento.away_team_logo ? (
                              <img src={evento.away_team_logo} alt="" className="w-4 h-4 object-contain" />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-[8px] font-bold">
                                {evento.away_team_short.slice(0, 1)}
                              </div>
                            )}
                            <span className="text-xs font-medium truncate">{evento.away_team}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Desktop View - Grouped by League */
        <div className="space-y-4">
          {isLoading ? (
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
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full max-w-[200px]" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="w-14 h-10" />
                          <Skeleton className="w-14 h-10" />
                          <Skeleton className="w-14 h-10" />
                        </div>
                        <Skeleton className="w-24 h-8" />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold">Erro ao carregar eventos</h3>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </Card>
          ) : Object.keys(eventosPorLiga).length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Trophy className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-semibold">Nenhum jogo encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Tente outra data ou limpe os filtros
                </p>
              </div>
            </Card>
          ) : (
            Object.entries(eventosPorLiga).map(([liga, eventos]) => (
              <Card key={liga} className="overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border-b border-border">
                  {eventos[0]?.league_logo ? (
                    <img src={eventos[0].league_logo} alt="" className="w-5 h-5 object-contain" />
                  ) : (
                    <span>⚽</span>
                  )}
                  <span className="text-sm font-medium">{liga}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {eventos.length} jogos
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {eventos.map((evento) => (
                    <div
                      key={evento.id}
                      className={cn(
                        "p-3 flex items-center gap-4 hover:bg-secondary/30",
                        evento.is_live && "bg-primary/5"
                      )}
                    >
                      <div className="w-16 flex-shrink-0">
                        {evento.is_live ? (
                          <Badge variant="destructive" className="gap-1 text-xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            LIVE
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-sm">{evento.time}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-sm font-medium truncate">{evento.home_team}</span>
                            {evento.home_team_logo ? (
                              <img src={evento.home_team_logo} alt="" className="w-7 h-7 object-contain" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                {evento.home_team_short.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">vs</span>
                          <div className="flex items-center gap-2 flex-1">
                            {evento.away_team_logo ? (
                              <img src={evento.away_team_logo} alt="" className="w-7 h-7 object-contain" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                {evento.away_team_short.slice(0, 2)}
                              </div>
                            )}
                            <span className="text-sm font-medium truncate">{evento.away_team}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRegistrarAposta(evento)}>
                        Registrar
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
          <span className="text-xs text-muted-foreground">Atualizando...</span>
        </div>
      )}

      {/* Modal de Aposta */}
      <BetDialog
        open={betDialogOpen}
        onOpenChange={(open) => {
          setBetDialogOpen(open);
          if (!open) setSelectedEvent(null);
        }}
        initialEvent={selectedEvent}
        onSave={handleSaveBet}
      />
    </div>
  );
}
