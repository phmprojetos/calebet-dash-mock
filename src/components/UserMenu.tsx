import { User, LogOut, Moon, Sun, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditProfileDialog } from "./EditProfileDialog";
import { cn } from "@/lib/utils";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center w-16 h-8 rounded-full p-1 transition-all duration-300",
        isDark 
          ? "bg-gray-900 shadow-inner" 
          : "bg-gray-200 shadow-inner"
      )}
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {/* Icons container */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        {/* Sun icon (left side, visible in light mode) */}
        <Sun 
          className={cn(
            "h-4 w-4 transition-opacity duration-300",
            isDark ? "opacity-0" : "opacity-60 text-gray-600"
          )} 
        />
        {/* Moon and stars (right side, visible in dark mode) */}
        <div className={cn(
          "flex items-center gap-0.5 transition-opacity duration-300",
          isDark ? "opacity-60 text-gray-400" : "opacity-0"
        )}>
          <Star className="h-2 w-2 fill-current" />
          <Moon className="h-4 w-4" />
        </div>
      </div>

      {/* Sliding circle */}
      <div
        className={cn(
          "relative z-10 w-6 h-6 rounded-full shadow-md transition-all duration-300 transform",
          isDark 
            ? "translate-x-0 bg-white" 
            : "translate-x-8 bg-gray-800"
        )}
      />
    </button>
  );
};

export const UserMenu = () => {
  const { profile, signOut } = useAuth();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getInitials = (nome: string) => {
    const parts = nome.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  };

  if (!profile) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Theme Toggle */}
      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(profile.nome)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline">{profile.nome}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </div>
  );
};
