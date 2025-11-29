import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Wallet, ArrowLeft, TrendingUp, Target, BarChart3 } from "lucide-react";

export default function Auth() {
  const { signUp, signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Cadastro
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupNome, setSignupNome] = useState("");
  const [signupBanca, setSignupBanca] = useState("");

  // Reset
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const bancaInicial = parseFloat(signupBanca) || 0;

    const { error } = await signUp(signupEmail, signupPassword, signupNome, bancaInicial);

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login.",
      });
    }

    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(resetEmail);

    if (error) {
      toast({
        title: "Erro ao resetar senha",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para resetar a senha.",
      });
      setShowReset(false);
    }

    setLoading(false);
  };

  // Features do app
  const features = [
    { icon: TrendingUp, title: "Análise de ROI", desc: "Acompanhe seu retorno" },
    { icon: Target, title: "Win Rate", desc: "Métricas de desempenho" },
    { icon: BarChart3, title: "Insights", desc: "Decisões inteligentes" },
  ];

  if (showReset) {
    return (
      <div className="min-h-screen flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">🎲</span>
              </div>
              <span className="text-white font-bold text-3xl">CALEBet</span>
            </div>
            <p className="text-white/80 text-lg">Gestão inteligente de apostas</p>
          </div>

          <div className="relative z-10 space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10">
            <p className="text-white/40 text-sm">
              © 2025 CALEBet. Todos os direitos reservados.
            </p>
            <p className="text-white/40 text-xs mt-1">
              Desenvolvido por{" "}
              <a 
                href="https://www.redmedia.com.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
              >
                Redmedia
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel - Reset Form */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md">
            <Button
              variant="ghost"
              className="mb-8"
              onClick={() => setShowReset(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Button>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Resetar Senha</h1>
              <p className="text-muted-foreground mt-2">
                Digite seu email para receber instruções de reset
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Email de Reset
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <span className="text-2xl">🎲</span>
            </div>
            <span className="text-white font-bold text-3xl tracking-tight">CALEBet</span>
          </div>
          <p className="text-white/80 text-lg">Gestão inteligente de apostas esportivas</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-white/90 text-xl font-semibold mb-4">
            Tome decisões baseadas em dados
          </h2>
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors flex items-center justify-center border border-white/10">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/20 border-2 border-primary flex items-center justify-center text-xs text-white font-medium"
                >
                  {["PM", "JS", "MR", "LC"][i - 1]}
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm">
              <span className="font-semibold text-white">+500</span> apostadores ativos
            </p>
          </div>
          <div>
            <p className="text-white/40 text-sm">
              © 2025 CALEBet. Todos os direitos reservados.
            </p>
            <p className="text-white/40 text-xs mt-1">
              Desenvolvido por{" "}
              <a 
                href="https://www.redmedia.com.br/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white underline underline-offset-2 transition-colors"
              >
                Redmedia
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl">🎲</span>
            </div>
            <span className="text-foreground font-bold text-2xl">CALEBet</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-foreground">Bem-vindo!</h1>
            <p className="text-muted-foreground mt-2">
              Entre ou crie sua conta para continuar
            </p>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                  <TabsTrigger value="login" className="text-sm h-10">Entrar</TabsTrigger>
                  <TabsTrigger value="signup" className="text-sm h-10">Criar Conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-11"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Senha</Label>
                        <Button
                          type="button"
                          variant="link"
                          className="px-0 h-auto text-xs text-muted-foreground hover:text-primary"
                          onClick={() => setShowReset(true)}
                        >
                          Esqueceu a senha?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 h-11"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Entrar
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-nome">Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-nome"
                          type="text"
                          placeholder="Seu nome completo"
                          className="pl-10 h-11"
                          value={signupNome}
                          onChange={(e) => setSignupNome(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 h-11"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          className="pl-10 h-11"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-banca">Banca Inicial (opcional)</Label>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-banca"
                          type="number"
                          step="0.01"
                          placeholder="R$ 1.000,00"
                          className="pl-10 h-11"
                          value={signupBanca}
                          onChange={(e) => setSignupBanca(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar Conta
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Ao criar uma conta, você concorda com nossos{" "}
                      <a href="#" className="text-primary hover:underline">Termos de Uso</a>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
