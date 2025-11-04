import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockPreviewData = [
  {
    event: "Flamengo x Palmeiras",
    market: "Over 1 HT Asiático",
    odd: "1.92",
    stake: "500",
    result: "win",
  },
  {
    event: "Corinthians x Grêmio",
    market: "Ambas Marcam",
    odd: "2.05",
    stake: "500",
    result: "loss",
  },
  {
    event: "São Paulo x Santos",
    market: "Over 1 HT Asiático",
    odd: "1.88",
    stake: "500",
    result: "win",
  },
  {
    event: "Internacional x Athletico",
    market: "Resultado Final",
    odd: "2.20",
    stake: "500",
    result: "loss",
  },
  {
    event: "Botafogo x Vasco",
    market: "Over 2.5 Gols",
    odd: "1.95",
    stake: "500",
    result: "loss",
  },
];

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setShowPreview(true);
    }
  };

  const handleImport = () => {
    toast({
      title: "CSV importado com sucesso!",
      description: `${mockPreviewData.length} apostas foram importadas.`,
    });
    setFile(null);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar CSV</h1>
        <p className="text-muted-foreground">Importe suas apostas em lote através de arquivo CSV</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
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
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização dos Dados</CardTitle>
            <CardDescription>
              Primeiras 5 linhas do arquivo. Confira antes de importar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Mercado</TableHead>
                    <TableHead>Odd</TableHead>
                    <TableHead>Stake</TableHead>
                    <TableHead>Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPreviewData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.event}</TableCell>
                      <TableCell>{row.market}</TableCell>
                      <TableCell>{row.odd}</TableCell>
                      <TableCell>R$ {row.stake}</TableCell>
                      <TableCell className="capitalize">{row.result}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImport}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar Importação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
