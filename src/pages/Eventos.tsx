import { useMemo, useState } from "react";

interface Evento {
  id: string;
  date: string; // yyyy-mm-dd
  league: string;
  homeTeam: string;
  awayTeam: string;
  time: string; // HH:mm
  homeOdd: number;
  drawOdd: number;
  awayOdd: number;
}

const eventosMock: Evento[] = [
  {
    id: "1",
    date: formatDateKey(new Date()),
    league: "Premier League",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    time: "19:30",
    homeOdd: 1.85,
    drawOdd: 3.4,
    awayOdd: 4.1,
  },
  {
    id: "2",
    date: formatDateKey(new Date()),
    league: "La Liga",
    homeTeam: "Barcelona",
    awayTeam: "Real Sociedad",
    time: "21:00",
    homeOdd: 1.72,
    drawOdd: 3.6,
    awayOdd: 4.5,
  },
  {
    id: "3",
    date: formatDateKey(addDays(new Date(), 1)),
    league: "Serie A",
    homeTeam: "Juventus",
    awayTeam: "Napoli",
    time: "17:00",
    homeOdd: 2.05,
    drawOdd: 3.1,
    awayOdd: 3.65,
  },
  {
    id: "4",
    date: formatDateKey(addDays(new Date(), 2)),
    league: "Bundesliga",
    homeTeam: "Bayern München",
    awayTeam: "RB Leipzig",
    time: "16:30",
    homeOdd: 1.95,
    drawOdd: 3.3,
    awayOdd: 3.9,
  },
];

function formatDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekdayLabel(date: Date) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });
  return formatter.format(date).replace(".", "").toUpperCase();
}

function getDayOfMonth(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date);
}

function getEventosByDate(date: string) {
  return eventosMock.filter((evento) => evento.date === date);
}

export default function Eventos() {
  const todayKey = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const dias = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const currentDate = addDays(new Date(), index);
      return {
        key: formatDateKey(currentDate),
        weekday: getWeekdayLabel(currentDate),
        day: getDayOfMonth(currentDate),
        isToday: index === 0,
      };
    });
  }, []);

  const eventosFiltrados = useMemo(() => {
    return getEventosByDate(selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDate]);

  const handleRegistrarAposta = (evento: Evento) => {
    // Futuramente este botão poderá abrir um modal ou disparar uma ação de API
    console.log("Registrar aposta para", evento);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
        <header className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-500">Calebet</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Eventos</h1>
          </div>
          <div className="text-base text-slate-400">
            <p className="font-medium text-slate-200">Encontre os principais jogos de futebol para apostar</p>
            <p className="text-slate-400">Escolha uma data e veja os jogos disponíveis.</p>
          </div>
        </header>

        <section className="flex items-center gap-3 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-sm">
          {dias.map((dia) => {
            const isSelected = selectedDate === dia.key;

            return (
              <button
                key={dia.key}
                onClick={() => setSelectedDate(dia.key)}
                className={`flex min-w-[90px] flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-800/70"
                }`}
              >
                <span className="text-xs uppercase tracking-wide opacity-90">{dia.weekday}</span>
                <span className="text-lg font-bold leading-none">{dia.day}</span>
                {dia.isToday ? (
                  <span className="text-[10px] font-medium text-emerald-100">Hoje</span>
                ) : null}
              </button>
            );
          })}
        </section>

        <section className="flex flex-col gap-4">
          {eventosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-10 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">⚽️</div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-100">Nenhum jogo encontrado para esta data</h3>
                <p className="text-sm text-slate-400">Escolha outro dia no calendário ou volte mais tarde.</p>
              </div>
            </div>
          ) : (
            eventosFiltrados.map((evento) => (
              <article
                key={evento.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="font-semibold text-slate-200">{evento.league}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">
                    {evento.time}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-2xl font-bold sm:text-3xl">
                    <span>{evento.homeTeam}</span>
                    <span className="mx-2 text-emerald-400"> x </span>
                    <span>{evento.awayTeam}</span>
                  </div>

                  <button
                    onClick={() => handleRegistrarAposta(evento)}
                    className="mt-2 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:mt-0"
                  >
                    Registrar Aposta
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {[{ label: "1", value: evento.homeOdd }, { label: "X", value: evento.drawOdd }, { label: "2", value: evento.awayOdd }].map(
                    (odd) => (
                      <div
                        key={odd.label}
                        className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-100"
                      >
                        <span className="text-slate-400">{odd.label}</span>
                        <span className="text-lg">{odd.value.toFixed(2)}</span>
                      </div>
                    ),
                  )}
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

