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
import { useIsMobile } from "@/hooks/use-mobile";

export type DateRangePeriod = "today" | "7days" | "30days" | "all" | "custom";

interface DateRangeFilterProps {
  onRangeChange: (startDate: Date, endDate: Date) => void;
  selectedPeriod?: DateRangePeriod;
  onPeriodChange?: (period: DateRangePeriod) => void;
  customRange?: { startDate: Date; endDate: Date };
}

export function DateRangeFilter({
  onRangeChange,
  selectedPeriod,
  onPeriodChange,
  customRange,
}: DateRangeFilterProps) {
  const [internalSelectedPeriod, setInternalSelectedPeriod] = useState<DateRangePeriod>(selectedPeriod ?? "all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const isMobile = useIsMobile();

  const currentPeriod = selectedPeriod ?? internalSelectedPeriod;

  useEffect(() => {
    if (selectedPeriod !== undefined) {
      setInternalSelectedPeriod(selectedPeriod);

      if (selectedPeriod !== "custom") {
        setDateRange(undefined);
      }
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (!customRange || currentPeriod !== "custom") {
      return;
    }

    setDateRange({ from: customRange.startDate, to: customRange.endDate });
  }, [customRange, currentPeriod]);

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
    <div className="flex flex-col gap-3 mb-6">
      {/* Period buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant={currentPeriod === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodClick("today")}
          className="w-full text-xs sm:text-sm"
        >
          Hoje
        </Button>

        <Button
          variant={currentPeriod === "7days" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodClick("7days")}
          className="w-full text-xs sm:text-sm"
        >
          7 dias
        </Button>

        <Button
          variant={currentPeriod === "30days" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodClick("30days")}
          className="w-full text-xs sm:text-sm"
        >
          30 dias
        </Button>

        <Button
          variant={currentPeriod === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodClick("all")}
          className="w-full text-xs sm:text-sm"
        >
          Todos
        </Button>
      </div>

      {/* Custom date range picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={currentPeriod === "custom" ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full font-normal text-xs sm:text-sm",
              dateRange?.from ? "justify-start text-left" : "justify-center text-center"
            )}
          >
            <CalendarIcon className={cn("h-4 w-4 flex-shrink-0", dateRange?.from ? "mr-2" : "mr-2")} />
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
            numberOfMonths={isMobile ? 1 : 2}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
