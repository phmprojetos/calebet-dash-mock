import { useState } from "react";
import { isAxiosError } from "axios";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { importService } from "@/services/importService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await importService.importCSV(file);
      
      toast({
        title: "CSV importado com sucesso!",
        description: `${result.imported_count} apostas foram importadas.`,
      });

      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      // Limpar estado e redirecionar
      setFile(null);
      setTimeout(() => navigate("/bets"), 1500);
    } catch (error: unknown) {
      toast({
        title: "Erro ao importar CSV",
        description:
          (isAxiosError(error) &&
            typeof error.response?.data?.detail === "string" &&
            error.response.data.detail) ||
          (error instanceof Error ? error.message : "Verifique o formato do arquivo e tente novamente."),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Importar CSV</h1>
        <p className="text-sm md:text-base text-muted-foreground">Importe suas apostas em lote através de arquivo CSV</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Upload de Arquivo</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Selecione um arquivo CSV com suas apostas. O arquivo deve conter as colunas: evento,
            mercado, odd, stake, resultado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 border-border hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {file ? (
                  <>
                    <FileSpreadsheet className="w-12 h-12 mb-4 text-success" />
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">{file.name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Clique para selecionar outro arquivo
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste o
                      arquivo
                    </p>
                    <p className="text-xs text-muted-foreground">CSV (MAX. 10MB)</p>
                  </>
                )}
              </div>
              <input
                id="csv-upload"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>

          {file && (
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setFile(null)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleImport}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar Importação
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">📝 Formato do CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>O arquivo CSV deve seguir este formato:</p>
          <pre className="bg-card p-3 rounded-md border">
            evento,mercado,odd,stake,resultado
            Flamengo x Palmeiras,Over 1 HT Asiático,1.92,500,win
            Corinthians x Grêmio,Ambas Marcam,2.05,500,loss
          </pre>
          <p>
            <strong>Resultados válidos:</strong> win, loss, pending, void, cashout
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
