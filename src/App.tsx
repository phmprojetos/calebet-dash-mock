import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserMenu } from "@/components/UserMenu";
import Dashboard from "./pages/Dashboard";
import Eventos from "./pages/Eventos";
import Bets from "./pages/Bets";
import Import from "./pages/Import";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <div className="min-h-screen flex w-full">
                      <AppSidebar />
                      <main className="flex-1">
                        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-10">
                          <SidebarTrigger />
                          <UserMenu />
                        </header>
                        <div className="p-6">
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/eventos" element={<Eventos />} />
                            <Route path="/bets" element={<Bets />} />
                            <Route path="/import" element={<Import />} />
                            <Route path="/import/cvs" element={<Import />} />
                            <Route path="/insights" element={<Insights />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </main>
                    </div>
                  </SidebarProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
