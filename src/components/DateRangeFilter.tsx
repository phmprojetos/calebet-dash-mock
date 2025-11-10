import { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DateRangePeriod = "today" | "7days" | "30days" | "all" | "custom";

interface DateRangeFilterProps {
  onRangeChange: (startDate: Date, endDate: Date) => void;
  selectedPeriod?: DateRangePeriod;
  onPeriodChange?: (period: DateRangePeriod) => void;
}

export function DateRangeFilter({ onRangeChange, selectedPeriod, onPeriodChange }: DateRangeFilterProps) {
  const [internalSelectedPeriod, setInternalSelectedPeriod] = useState<DateRangePeriod>(selectedPeriod ?? "all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const currentPeriod = selectedPeriod ?? internalSelectedPeriod;

  useEffect(() => {
    if (selectedPeriod !== undefined) {
      setInternalSelectedPeriod(selectedPeriod);

      if (selectedPeriod !== "custom") {
        setDateRange(undefined);
      }
    }
  }, [selectedPeriod]);

  const handlePeriodChange = (period: Exclude<DateRangePeriod, "custom">) => {
    if (selectedPeriod === undefined) {
      setInternalSelectedPeriod(period);
    }

    setDateRange(undefined);
    const now = new Date();

    switch (period) {
      case "today": {
        const start = new Date(now.setHours(0, 0, 0, 0));
        const end = new Date(now.setHours(23, 59, 59, 999));
        onRangeChange(start, end);
        break;
      }
      case "7days": {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        onRangeChange(start, end);
        break;
      }
      case "30days": {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        onRangeChange(start, end);
        break;
      }
      case "all": {
        const start = new Date("2025-01-01");
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        onRangeChange(start, end);
        break;
      }
    }

    onPeriodChange?.(period);
  };

  const handlePeriodClick = (period: DateRangePeriod) => {
    if (period === "custom") {
      return;
    }

    handlePeriodChange(period);
  };

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      if (selectedPeriod === undefined) {
        setInternalSelectedPeriod("custom");
      }
      onPeriodChange?.("custom");
      const start = new Date(range.from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(range.to);
      end.setHours(23, 59, 59, 999);
      onRangeChange(start, end);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
      <Button
        variant={currentPeriod === "today" ? "default" : "outline"}
        size="sm"
        onClick={() => handlePeriodClick("today")}
        className="min-w-[80px]"
      >
        Hoje
      </Button>

      <Button
        variant={currentPeriod === "7days" ? "default" : "outline"}
        size="sm"
        onClick={() => handlePeriodClick("7days")}
        className="min-w-[80px]"
      >
        7 dias
      </Button>

      <Button
        variant={currentPeriod === "30days" ? "default" : "outline"}
        size="sm"
        onClick={() => handlePeriodClick("30days")}
        className="min-w-[80px]"
      >
        30 dias
      </Button>

      <Button
        variant={currentPeriod === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => handlePeriodClick("all")}
        className="min-w-[80px]"
      >
        Todos
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={currentPeriod === "custom" ? "default" : "outline"}
            size="sm"
            className={cn("min-w-[240px] justify-start text-left font-normal")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Período personalizado</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleCustomRangeSelect}
            numberOfMonths={2}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
