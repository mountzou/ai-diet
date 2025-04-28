// src/components/ui/datetime-picker.jsx
"use client";

import * as React from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper functions
function getValidHour(value) {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return "00";
  if (parsed > 23) return "23";
  if (parsed < 0) return "00";
  return parsed.toString().padStart(2, "0");
}

function getValidMinuteOrSecond(value) {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return "00";
  if (parsed > 59) return "59";
  if (parsed < 0) return "00";
  return parsed.toString().padStart(2, "0");
}

const TimePickerInput = React.forwardRef(
  ({ className, value, onChange, placeholder, onLeftFocus, onRightFocus, type = "hours", ...props }, ref) => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") onRightFocus?.();
      if (e.key === "ArrowLeft") onLeftFocus?.();
      
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const step = e.key === "ArrowUp" ? 1 : -1;
        const currentValue = parseInt(value, 10) || 0;
        let newValue = currentValue + step;
        
        if (type === "hours") {
          if (newValue > 23) newValue = 0;
          if (newValue < 0) newValue = 23;
        } else {
          if (newValue > 59) newValue = 0;
          if (newValue < 0) newValue = 59;
        }
        
        onChange?.(newValue.toString().padStart(2, "0"));
      }
    };

    return (
      <Input
        ref={ref}
        className={cn(
          "w-12 text-center font-mono text-base tabular-nums caret-transparent",
          className
        )}
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          const sanitized = val.replace(/[^0-9]/g, "").slice(0, 2);
          onChange?.(type === "hours" ? getValidHour(sanitized) : getValidMinuteOrSecond(sanitized));
        }}
        type="text"
        inputMode="numeric"
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);
TimePickerInput.displayName = "TimePickerInput";

const TimePeriodSelect = React.forwardRef(
  ({ value, onChange, onLeftFocus }, ref) => {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          ref={ref} 
          className="w-[65px]"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onLeftFocus?.();
          }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    );
  }
);
TimePeriodSelect.displayName = "TimePeriodSelect";

const TimePicker = React.forwardRef(
  ({ value, onChange, hourCycle = 24 }, ref) => {
    const hourRef = React.useRef(null);
    const minuteRef = React.useRef(null);
    const periodRef = React.useRef(null);
    
    const date = value || new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const [hour, setHour] = React.useState(
      hourCycle === 12
        ? (hours % 12 || 12).toString().padStart(2, "0")
        : hours.toString().padStart(2, "0")
    );
    const [minute, setMinute] = React.useState(minutes.toString().padStart(2, "0"));
    const [period, setPeriod] = React.useState(hours >= 12 ? "PM" : "AM");
    
    React.useEffect(() => {
      if (!value) return;
      
      const hours = value.getHours();
      const minutes = value.getMinutes();
      
      setHour(
        hourCycle === 12
          ? (hours % 12 || 12).toString().padStart(2, "0")
          : hours.toString().padStart(2, "0")
      );
      setMinute(minutes.toString().padStart(2, "0"));
      setPeriod(hours >= 12 ? "PM" : "AM");
    }, [value, hourCycle]);
    
    const handleTimeChange = () => {
      const newDate = new Date(date);
      let newHours = parseInt(hour, 10);
      
      if (hourCycle === 12) {
        newHours = period === "AM" 
          ? (newHours === 12 ? 0 : newHours)
          : (newHours === 12 ? 12 : newHours + 12);
      }
      
      newDate.setHours(newHours);
      newDate.setMinutes(parseInt(minute, 10));
      newDate.setSeconds(0);
      
      onChange?.(newDate);
    };
    
    React.useEffect(() => {
      handleTimeChange();
    }, [hour, minute, period]);
    
    return (
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        
        <TimePickerInput
          ref={hourRef}
          type="hours"
          value={hour}
          onChange={(value) => setHour(value)}
          placeholder="HH"
          onRightFocus={() => minuteRef.current?.focus()}
        />
        
        <span className="text-muted-foreground">:</span>
        
        <TimePickerInput
          ref={minuteRef}
          type="minutes"
          value={minute}
          onChange={(value) => setMinute(value)}
          placeholder="MM"
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => periodRef.current?.focus()}
        />
        
        {hourCycle === 12 && (
          <TimePeriodSelect
            ref={periodRef}
            value={period}
            onChange={setPeriod}
            onLeftFocus={() => minuteRef.current?.focus()}
          />
        )}
      </div>
    );
  }
);
TimePicker.displayName = "TimePicker";

export function DateTimePicker({ value, onChange, hourCycle = 24 }) {
  const [date, setDate] = React.useState(value);
  
  const handleChange = (newDate) => {
    setDate(newDate);
    onChange?.(newDate);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, hourCycle === 12 ? "PPP h:mm a" : "PPP HH:mm")
          ) : (
            <span>Pick date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (!newDate) return;
            
            // Preserve the time when selecting a new date
            if (date) {
              newDate.setHours(
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
                date.getMilliseconds()
              );
            }
            
            handleChange(newDate);
          }}
          initialFocus
        />
        <div className="border-t p-3">
          <TimePicker
            value={date}
            onChange={handleChange}
            hourCycle={hourCycle}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}