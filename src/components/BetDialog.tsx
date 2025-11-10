import { useState, useEffect } from "react";
import { Bet } from "@/lib/mockData";
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

interface BetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bet?: Bet;
  onSave: (bet: Bet) => void;
}

export function BetDialog({ open, onOpenChange, bet, onSave }: BetDialogProps) {
  const [formData, setFormData] = useState<Bet>({
    id: "",
    event: "",
    market: "",
    odd: 0,
    stake: 0,
    result: "pending",
    profit: 0,
    created_at: new Date().toISOString(),
    source: "dashboard",
  });

  useEffect(() => {
    if (bet) {
      setFormData(bet);
    } else {
      setFormData({
        id: `BET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        event: "",
        market: "",
        odd: 0,
        stake: 0,
        result: "pending",
        profit: 0,
        created_at: new Date().toISOString(),
        source: "dashboard",
      });
    }
  }, [bet, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{bet ? "Editar Aposta" : "Nova Aposta"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event">Evento</Label>
              <Input
                id="event"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="Ex: Flamengo x Palmeiras"
                required
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="odd">Odd</Label>
                <Input
                  id="odd"
                  type="number"
                  step="0.01"
                  value={formData.odd}
                  onChange={(e) =>
                    setFormData({ ...formData, odd: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stake">Stake (R$)</Label>
                <Input
                  id="stake"
                  type="number"
                  value={formData.stake}
                  onChange={(e) =>
                    setFormData({ ...formData, stake: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
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
                    <SelectItem value="win">Vitória</SelectItem>
                    <SelectItem value="loss">Derrota</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                    <SelectItem value="cashout">Cashout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profit">Lucro (R$)</Label>
                <Input
                  id="profit"
                  type="number"
                  value={formData.profit}
                  onChange={(e) =>
                    setFormData({ ...formData, profit: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
