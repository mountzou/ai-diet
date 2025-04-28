// src/components/ui/date-time-picker.jsx
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function DateTimePicker({ date, setDate, maxDate }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  
  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      // Preserve the time from the current date
      const newDate = new Date(selectedDate);
      if (date) {
        newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      }
      setDate(newDate);
    }
  };

  const handleTimeChange = (type, value) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(parseInt(value), newDate.getMinutes(), 0, 0);
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value), 0, 0);
      }
      setDate(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            format(date, "PPP 'at' h:mm a")
          ) : (
            <span>Pick date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
        alignOffset={0}
        avoidCollisions={true}
        style={{ zIndex: 100 }}
      >
        <div className="flex flex-col md:flex-row">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            disabled={maxDate ? (date) => date > maxDate : undefined}
            className="rounded-md border"
          />
          <div className="flex flex-row md:flex-col border-t md:border-t-0 md:border-l">
            <div className="grid grid-cols-4 gap-1 p-2">
              <div className="text-xs text-center font-medium pb-1 col-span-4">Hour</div>
              {hours.map((hour) => (
                <Button
                  key={hour}
                  size="sm"
                  variant={date && date.getHours() === hour ? "default" : "ghost"}
                  className="h-8 w-8 p-0 font-normal"
                  onClick={() => handleTimeChange("hour", hour.toString())}
                >
                  {hour.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 p-2 border-l md:border-l-0 md:border-t">
              <div className="text-xs text-center font-medium pb-1 col-span-3">Minute</div>
              {minutes.map((minute) => (
                <Button
                  key={minute}
                  size="sm"
                  variant={date && date.getMinutes() === minute ? "default" : "ghost"}
                  className="h-8 w-8 p-0 font-normal"
                  onClick={() => handleTimeChange("minute", minute.toString())}
                >
                  {minute.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}