import {
  CalendarDays,
  LayoutDashboard,
  FileText,
  Upload,
  Lightbulb,
  Settings,
  LogOut,
  TrendingUp,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Eventos", url: "/", icon: CalendarDays },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Minhas Apostas", url: "/bets", icon: FileText },
  { title: "Importar CSV", url: "/import", icon: Upload },
  { title: "Insights", url: "/insights", icon: Lightbulb },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const { signOut, user } = useAuth();

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="p-3 bg-card">
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-3 px-2 py-4 mb-2",
          !open && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
            <span className="text-xl">🎲</span>
          </div>
          {open && (
            <span className="text-foreground font-bold text-xl tracking-tight">
              CALEBet
            </span>
          )}
        </div>

        {/* Stats card - only when expanded */}
        {open && (
          <div className="bg-secondary/50 rounded-xl p-3 mb-4 mx-1 border border-border">
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-2">
              <span>Lucro do mês</span>
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
            <div className="text-foreground font-bold text-lg">+R$ 2.450</div>
            <div className="text-primary text-xs">↑ 12.5% ROI</div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 space-y-1 px-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              onClick={handleMenuClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  !open && "justify-center px-2 border-l-0"
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {open && <span className="text-sm">{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border bg-card">
        {/* User info */}
        {open && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-foreground text-sm font-medium truncate">
                {user?.email?.split("@")[0] || "Usuário"}
              </div>
              <div className="text-muted-foreground text-xs">Pro Member</div>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => {
            handleMenuClick();
            signOut();
          }}
          className={cn(
            "w-full flex items-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm py-2.5 px-3 rounded-lg transition-all",
            !open && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {open && <span>Sair</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
