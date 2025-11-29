import { useState, useEffect, useMemo } from "react";
import { Bet, FixtureSearchResult } from "@/lib/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFixturesSearch } from "@/hooks/useFixturesSearch";
import { Search, X, Loader2, Calendar, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDebounce } from "@/hooks/useDebounce";

interface BetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bet?: Bet;
  initialEvent?: string | null;
  onSave: (bet: Bet) => void;
}

type InputMode = "search" | "manual";

interface FormData {
  id: string;
  fixture_id?: number | null;
  home_team: string;
  away_team: string;
  event: string;
  market: string;
  odd: number;
  stake: number;
  result: Bet["result"];
  profit: number;
  is_live: boolean;
  created_at: string;
  source: string;
}

export function BetDialog({ open, onOpenChange, bet, initialEvent, onSave }: BetDialogProps) {
  const [inputMode, setInputMode] = useState<InputMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<FixtureSearchResult | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { fixtures, isLoading, isFetching } = useFixturesSearch({
    query: debouncedQuery,
    limit: 10,
    enabled: inputMode === "search" && showDropdown,
  });

  const [formData, setFormData] = useState<FormData>({
    id: "",
    fixture_id: null,
    home_team: "",
    away_team: "",
    event: "",
    market: "",
    odd: 0,
    stake: 0,
    result: "pending",
    profit: 0,
    is_live: false,
    created_at: new Date().toISOString(),
    source: "dashboard",
  });

  // Inicializar formulário
  useEffect(() => {
    if (bet) {
      // Modo edição - preencher com dados da aposta
      setFormData({
        id: bet.id,
        fixture_id: bet.fixture_id || null,
        home_team: bet.home_team || "",
        away_team: bet.away_team || "",
        event: bet.event,
        market: bet.market,
        odd: bet.odd,
        stake: bet.stake,
        result: bet.result,
        profit: bet.profit ?? 0,
        is_live: bet.is_live || false,
        created_at: bet.created_at,
        source: bet.source || "dashboard",
      });
      // Em edição, usar modo manual pois já temos os dados
      setInputMode("manual");
      setSelectedFixture(null);
      setSearchQuery("");
    } else {
      // Nova aposta
      const newId = `BET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      if (initialEvent) {
        // Se temos initialEvent, tentar extrair home_team e away_team
        const eventParts = initialEvent.split(/\s+(?:vs?|x)\s+/i);
        const homeTeam = eventParts[0]?.trim() || "";
        const awayTeam = eventParts[1]?.trim() || initialEvent;

        setFormData({
          id: newId,
          fixture_id: null,
          home_team: homeTeam,
          away_team: awayTeam,
          event: initialEvent,
          market: "",
          odd: 0,
          stake: 0,
          result: "pending",
          profit: 0,
          is_live: false,
          created_at: new Date().toISOString(),
          source: "dashboard",
        });
        setInputMode("manual");
        setSearchQuery(initialEvent);
      } else {
        setFormData({
          id: newId,
          fixture_id: null,
          home_team: "",
          away_team: "",
          event: "",
          market: "",
          odd: 0,
          stake: 0,
          result: "pending",
          profit: 0,
          is_live: false,
          created_at: new Date().toISOString(),
          source: "dashboard",
        });
        setInputMode("search");
        setSearchQuery("");
      }
      setSelectedFixture(null);
    }
    setShowDropdown(false);
  }, [bet, open, initialEvent]);

  // Calcular profit automaticamente
  useEffect(() => {
    setFormData((prev) => {
      const stake = Number.isFinite(prev.stake) ? prev.stake : 0;
      const odd = Number.isFinite(prev.odd) ? prev.odd : 0;

      let computedProfit = prev.profit;

      switch (prev.result) {
        case "win":
          computedProfit = stake * odd - stake;
          break;
        case "loss":
          computedProfit = -stake;
          break;
        case "void":
        case "pending":
          computedProfit = 0;
          break;
        default:
          return prev;
      }

      if (computedProfit === prev.profit) {
        return prev;
      }

      return { ...prev, profit: computedProfit };
    });
  }, [formData.stake, formData.odd, formData.result]);

  // Selecionar fixture do autocomplete
  const handleSelectFixture = (fixture: FixtureSearchResult) => {
    setSelectedFixture(fixture);
    setFormData((prev) => ({
      ...prev,
      fixture_id: fixture.id,
      home_team: fixture.home_team_name,
      away_team: fixture.away_team_name,
      event: fixture.event_name,
    }));
    setSearchQuery(fixture.event_name);
    setShowDropdown(false);
  };

  // Limpar seleção
  const handleClearSelection = () => {
    setSelectedFixture(null);
    setFormData((prev) => ({
      ...prev,
      fixture_id: null,
      home_team: "",
      away_team: "",
      event: "",
    }));
    setSearchQuery("");
  };

  // Alternar para modo manual
  const handleSwitchToManual = () => {
    setInputMode("manual");
    setShowDropdown(false);
    setSelectedFixture(null);
    // Manter o que foi digitado na busca como home_team
    if (searchQuery && !formData.home_team) {
      setFormData((prev) => ({ ...prev, home_team: searchQuery }));
    }
  };

  // Alternar para modo busca
  const handleSwitchToSearch = () => {
    setInputMode("search");
    setSearchQuery("");
    setFormData((prev) => ({
      ...prev,
      fixture_id: null,
      home_team: "",
      away_team: "",
      event: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construir o event se não existir
    let finalEvent = formData.event;
    if (!finalEvent && formData.home_team && formData.away_team) {
      finalEvent = `${formData.home_team} vs ${formData.away_team}`;
    } else if (!finalEvent && formData.home_team) {
      finalEvent = formData.home_team;
    }

    const betToSave: Bet = {
      id: formData.id,
      fixture_id: formData.fixture_id,
      home_team: formData.home_team || null,
      away_team: formData.away_team || null,
      event: finalEvent,
      market: formData.market,
      odd: formData.odd,
      stake: formData.stake,
      result: formData.result,
      profit: formData.profit,
      is_live: formData.is_live,
      created_at: formData.created_at,
      source: formData.source,
    };

    onSave(betToSave);
  };

  const isProfitDisabled =
    !formData.result ||
    formData.result === "pending" ||
    formData.result === "void";

  // Formatar data do fixture
  const formatFixtureDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "dd/MM HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  // Verificar se o formulário é válido para submit
  const isFormValid = useMemo(() => {
    const hasTeamInfo =
      (formData.home_team && formData.away_team) || formData.event;
    return hasTeamInfo && formData.market && formData.odd > 0 && formData.stake > 0;
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{bet ? "Editar Aposta" : "Nova Aposta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="grid gap-4 py-4 px-1">
            {/* Seção de Evento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Evento</Label>
                {!bet && (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={inputMode === "search" ? "default" : "ghost"}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => inputMode === "manual" && handleSwitchToSearch()}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Buscar
                    </Button>
                    <Button
                      type="button"
                      variant={inputMode === "manual" ? "default" : "ghost"}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={handleSwitchToManual}
                    >
                      Manual
                    </Button>
                  </div>
                )}
              </div>

              {inputMode === "search" && !bet ? (
                /* Modo Busca */
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar partida... (ex: Flamengo)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                        if (selectedFixture) {
                          setSelectedFixture(null);
                          setFormData((prev) => ({
                            ...prev,
                            fixture_id: null,
                            home_team: "",
                            away_team: "",
                            event: "",
                          }));
                        }
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="pl-9 pr-9"
                    />
                    {(searchQuery || selectedFixture) && (
                      <button
                        type="button"
                        onClick={handleClearSelection}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown de resultados */}
                  {showDropdown && searchQuery.length >= 2 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoading || isFetching ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : fixtures.length > 0 ? (
                        <div className="py-1">
                          {fixtures.map((fixture) => (
                            <button
                              key={fixture.id}
                              type="button"
                              onClick={() => handleSelectFixture(fixture)}
                              className={cn(
                                "w-full px-3 py-2 text-left hover:bg-secondary transition-colors",
                                "flex items-center gap-3"
                              )}
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {fixture.event_name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatFixtureDate(fixture.date)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Nenhuma partida encontrada
                          </p>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handleSwitchToManual}
                            className="mt-1"
                          >
                            Inserir manualmente
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fixture selecionado */}
                  {selectedFixture && (
                    <div className="mt-2 p-2 bg-secondary/50 rounded-lg flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium flex-1">
                        {selectedFixture.event_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatFixtureDate(selectedFixture.date)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Modo Manual */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="home_team" className="text-xs">
                        Time Casa
                      </Label>
                      <Input
                        id="home_team"
                        value={formData.home_team}
                        onChange={(e) =>
                          setFormData({ ...formData, home_team: e.target.value })
                        }
                        placeholder="Ex: Flamengo"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="away_team" className="text-xs">
                        Time Fora
                      </Label>
                      <Input
                        id="away_team"
                        value={formData.away_team}
                        onChange={(e) =>
                          setFormData({ ...formData, away_team: e.target.value })
                        }
                        placeholder="Ex: Palmeiras"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mercado */}
            <div className="grid gap-2">
              <Label htmlFor="market">Mercado</Label>
              <Input
                id="market"
                value={formData.market}
                onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                placeholder="Ex: Over 1 HT Asiático"
                required
              />
            </div>

            {/* Odd e Stake */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="odd">Odd</Label>
                <Input
                  id="odd"
                  type="number"
                  step="0.01"
                  value={formData.odd || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      odd: Number.isFinite(parseFloat(e.target.value))
                        ? parseFloat(e.target.value)
                        : 0,
                    })
                  }
                  placeholder="1.95"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stake">Stake (R$)</Label>
                <Input
                  id="stake"
                  type="number"
                  value={formData.stake || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stake: Number.isFinite(parseFloat(e.target.value))
                        ? parseFloat(e.target.value)
                        : 0,
                    })
                  }
                  placeholder="100"
                  required
                />
              </div>
            </div>

            {/* Resultado e Lucro */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="result">Resultado</Label>
                <Select
                  value={formData.result}
                  onValueChange={(value: Bet["result"]) =>
                    setFormData({ ...formData, result: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="win">Vitória</SelectItem>
                    <SelectItem value="loss">Derrota</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                    <SelectItem value="cashout">Cashout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profit">Lucro/Perda (R$)</Label>
                <Input
                  id="profit"
                  type="number"
                  value={formData.profit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profit: Number.isFinite(parseFloat(e.target.value))
                        ? parseFloat(e.target.value)
                        : 0,
                    })
                  }
                  disabled={isProfitDisabled}
                />
              </div>
            </div>

            {/* Aposta ao Vivo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_live"
                checked={formData.is_live}
                onChange={(e) =>
                  setFormData({ ...formData, is_live: e.target.checked })
                }
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="is_live" className="text-sm font-normal cursor-pointer">
                Aposta ao vivo
              </Label>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
