import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  Settings,
  LogOut,
  CalendarDays,
  Upload,
  User,
  Bell,
  TrendingUp,
  Flame,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, badge: null },
  { title: "Eventos", icon: CalendarDays, badge: "3" },
  { title: "Minhas Apostas", icon: FileText, badge: "5" },
  { title: "Importar", icon: Upload, badge: null },
  { title: "Insights", icon: Lightbulb, badge: "!" },
  { title: "Configurações", icon: Settings, badge: null },
];

// ============================================
// ESTILO 1: GLASSMORPHISM
// ============================================
function GlassSidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="relative h-[500px] w-[260px] rounded-2xl overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-800" />
      
      {/* Glass panel */}
      <div className="absolute inset-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-xl">🎲</span>
          </div>
          <span className="text-white font-bold text-xl">CALEBet</span>
        </div>

        {/* Stats card */}
        <div className="bg-white/10 rounded-xl p-3 mb-6 border border-white/10">
          <div className="flex items-center justify-between text-white/70 text-xs mb-2">
            <span>Lucro do mês</span>
            <TrendingUp className="h-3 w-3" />
          </div>
          <div className="text-white font-bold text-lg">+R$ 2.450</div>
          <div className="text-emerald-300 text-xs">↑ 12.5% ROI</div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => setActive(item.title)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active === item.title
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left text-sm">{item.title}</span>
              {item.badge && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">Pedro</div>
              <div className="text-white/50 text-xs">Pro Member</div>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 text-white/50 hover:text-white text-sm py-2">
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ESTILO 2: NEON CYBERPUNK
// ============================================
function NeonSidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="h-[500px] w-[260px] rounded-2xl bg-[#0a0a12] p-4 flex flex-col border border-cyan-500/20 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/20 blur-3xl" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <span className="text-xl">🎲</span>
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold text-xl">
          CALEBet
        </span>
      </div>

      {/* Streak indicator */}
      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-3 mb-6 border border-orange-500/30 relative z-10">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
          <div>
            <div className="text-orange-400 font-bold text-sm">5 Wins Streak!</div>
            <div className="text-orange-300/70 text-xs">Continue assim 🔥</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 relative z-10">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={() => setActive(item.title)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              active === item.title
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left text-sm">{item.title}</span>
            {item.badge && (
              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-cyan-500/20 relative z-10">
        <button className="w-full flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm py-2 transition-colors">
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}

// ============================================
// ESTILO 3: MINIMAL CLEAN
// ============================================
function MinimalSidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="h-[500px] w-[260px] rounded-2xl bg-white p-5 flex flex-col border border-gray-100 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
          <span className="text-white text-sm font-bold">C</span>
        </div>
        <span className="text-gray-900 font-semibold text-lg tracking-tight">CALEBet</span>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-0.5">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={() => setActive(item.title)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              active === item.title
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span className="flex-1 text-left text-sm">{item.title}</span>
            {item.badge && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                item.badge === "!" 
                  ? "bg-amber-100 text-amber-600" 
                  : "bg-gray-100 text-gray-600"
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-xs font-medium">PM</span>
          </div>
          <div className="flex-1">
            <div className="text-gray-900 text-sm font-medium">Pedro M.</div>
            <div className="text-gray-400 text-xs">Conta Pro</div>
          </div>
          <Settings className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ESTILO 4: GRADIENTE DARK
// ============================================
function GradientSidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="h-[500px] w-[260px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
          <span className="text-lg">🎲</span>
        </div>
        <div>
          <span className="text-white font-bold text-lg">CALEBet</span>
          <div className="text-emerald-400 text-xs">Dashboard</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-gray-400 text-xs mb-1">Win Rate</div>
          <div className="text-white font-bold">68%</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="text-gray-400 text-xs mb-1">ROI</div>
          <div className="text-emerald-400 font-bold">+15.2%</div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={() => setActive(item.title)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              active === item.title
                ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border-l-2 border-emerald-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left text-sm">{item.title}</span>
            {item.badge && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5">
        <button className="w-full flex items-center gap-2 text-gray-500 hover:text-white text-sm py-2 transition-colors">
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

// ============================================
// ESTILO 5: BENTO BOX
// ============================================
function BentoSidebar() {
  const [active, setActive] = useState("Dashboard");

  const mainItems = menuItems.slice(0, 3);
  const secondaryItems = menuItems.slice(3);

  return (
    <div className="h-[500px] w-[280px] rounded-2xl bg-gray-950 p-3 flex flex-col gap-3">
      {/* Logo card */}
      <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
          <span className="text-lg">🎲</span>
        </div>
        <div className="flex-1">
          <span className="text-white font-bold">CALEBet</span>
          <div className="text-gray-500 text-xs">Gestão de Apostas</div>
        </div>
        <Bell className="h-5 w-5 text-gray-500" />
      </div>

      {/* Main menu card */}
      <div className="bg-gray-900 rounded-xl p-2 flex-1">
        <div className="text-gray-500 text-xs uppercase tracking-wider px-2 py-2">Principal</div>
        <nav className="space-y-1">
          {mainItems.map((item) => (
            <button
              key={item.title}
              onClick={() => setActive(item.title)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active === item.title
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left text-sm">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-400 hover:bg-violet-500/20">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="text-gray-500 text-xs uppercase tracking-wider px-2 py-2 mt-4">Outros</div>
        <nav className="space-y-1">
          {secondaryItems.map((item) => (
            <button
              key={item.title}
              onClick={() => setActive(item.title)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                active === item.title
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left text-sm">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* User card */}
      <div className="bg-gray-900 rounded-xl p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <span className="text-sm">👤</span>
        </div>
        <div className="flex-1">
          <div className="text-white text-sm font-medium">Pedro</div>
          <div className="text-gray-500 text-xs">Plano Pro</div>
        </div>
        <LogOut className="h-4 w-4 text-gray-500 hover:text-white cursor-pointer" />
      </div>
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL DE DEMO
// ============================================
export default function SidebarDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Demo de Estilos de Sidebar
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Escolha o estilo que mais combina com o CALEBet
            </p>
          </div>
        </div>

        {/* Grid de demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Glass */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                1. Glassmorphism
              </span>
            </div>
            <GlassSidebar />
          </div>

          {/* Neon */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                2. Neon Cyberpunk
              </span>
            </div>
            <NeonSidebar />
          </div>

          {/* Minimal */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                3. Minimal Clean
              </span>
            </div>
            <MinimalSidebar />
          </div>

          {/* Gradient */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                4. Gradiente Dark
              </span>
            </div>
            <GradientSidebar />
          </div>

          {/* Bento */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                5. Bento Box
              </span>
            </div>
            <BentoSidebar />
          </div>
        </div>

        {/* Info */}
        <div className="mt-10 text-center text-gray-500 dark:text-gray-400">
          <p>Clique nos itens do menu para ver a interação. Qual estilo você prefere?</p>
        </div>
      </div>
    </div>
  );
}

