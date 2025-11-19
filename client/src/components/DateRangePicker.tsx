import { useState } from 'react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRange as DayPickerDateRange } from 'react-day-picker';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [preset, setPreset] = useState<string>('all');

  const handlePresetChange = (value: string) => {
    setPreset(value);
    
    const now = new Date();
    let newRange: DateRange | undefined;

    switch (value) {
      case 'last7days':
        newRange = {
          from: startOfDay(subDays(now, 7)),
          to: endOfDay(now),
        };
        break;
      case 'last30days':
        newRange = {
          from: startOfDay(subDays(now, 30)),
          to: endOfDay(now),
        };
        break;
      case 'lastMonth':
        newRange = {
          from: startOfDay(subMonths(now, 1)),
          to: endOfDay(now),
        };
        break;
      case 'all':
      default:
        newRange = undefined;
        break;
    }

    onChange?.(newRange);
  };

  const formatDateRange = () => {
    if (!value?.from) return 'Selecione o período';
    
    if (!value.to) {
      return format(value.from, 'dd/MM/yyyy', { locale: ptBR });
    }

    return `${format(value.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(
      value.to,
      'dd/MM/yyyy',
      { locale: ptBR }
    )}`;
  };

  return (
    <div className="flex gap-2">
      {/* Preset Selector */}
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os períodos</SelectItem>
          <SelectItem value="last7days">Últimos 7 dias</SelectItem>
          <SelectItem value="last30days">Últimos 30 dias</SelectItem>
          <SelectItem value="lastMonth">Último mês</SelectItem>
          <SelectItem value="custom">Customizado</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range Picker */}
      {preset === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={value as DayPickerDateRange}
              onSelect={(range) => onChange?.(range as DateRange)}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
