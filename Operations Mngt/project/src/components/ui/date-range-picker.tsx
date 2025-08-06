import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | { from: Date; to: Date };
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
  align?: "start" | "center" | "end";
  showComparisonOptions?: boolean;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  align = "start",
  showComparisonOptions = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Predefined ranges
  const predefinedRanges = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1, offset: 1 },
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "This month", type: "month", current: true },
    { label: "Last month", type: "month", offset: 1 },
    { label: "This quarter", type: "quarter", current: true },
    { label: "Last quarter", type: "quarter", offset: 1 },
    { label: "This year", type: "year", current: true },
    { label: "Last year", type: "year", offset: 1 },
  ];

  const handleSelectPredefinedRange = (range: any) => {
    let to = new Date();
    let from = new Date();

    if (range.type === "month") {
      if (range.current) {
        from = new Date(to.getFullYear(), to.getMonth(), 1);
      } else {
        const lastMonth = to.getMonth() - range.offset;
        const year = lastMonth < 0 ? to.getFullYear() - 1 : to.getFullYear();
        const month = lastMonth < 0 ? 12 + lastMonth : lastMonth;
        from = new Date(year, month, 1);
        to = new Date(year, month + 1, 0); // Last day of previous month
      }
    } else if (range.type === "quarter") {
      const currentQuarter = Math.floor(to.getMonth() / 3);
      if (range.current) {
        from = new Date(to.getFullYear(), currentQuarter * 3, 1);
      } else {
        const lastQuarter = currentQuarter - range.offset;
        const year = lastQuarter < 0 ? to.getFullYear() - 1 : to.getFullYear();
        const quarter = lastQuarter < 0 ? 4 + lastQuarter : lastQuarter;
        from = new Date(year, quarter * 3, 1);
        to = new Date(year, quarter * 3 + 3, 0);
      }
    } else if (range.type === "year") {
      if (range.current) {
        from = new Date(to.getFullYear(), 0, 1);
      } else {
        from = new Date(to.getFullYear() - range.offset, 0, 1);
        to = new Date(to.getFullYear() - range.offset, 11, 31);
      }
    } else {
      // Default to days
      if (range.offset) {
        from = new Date();
        from.setDate(from.getDate() - range.offset);
        to = new Date();
        to.setDate(to.getDate() - (range.offset - range.days + 1));
      } else {
        from.setDate(from.getDate() - range.days);
      }
    }

    onDateRangeChange({ from, to });
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex">
            <div className="border-r p-2">
              <div className="px-2 py-1.5 text-sm font-medium">Presets</div>
              <div className="grid gap-1">
                {predefinedRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => handleSelectPredefinedRange(range)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              
              {showComparisonOptions && (
                <>
                  <div className="mt-3 border-t pt-3 px-2 py-1.5 text-sm font-medium">
                    Compare to
                  </div>
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => {}}
                    >
                      Previous period
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => {}}
                    >
                      Same period last year
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="p-2">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange as DateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { DateRangePicker as DatePickerWithRange };