// src/components/ui/datetime-picker.jsx
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function DateTimePicker({ value, onChange }) {
  const [date, setDate] = React.useState(value || new Date());

  function handleDateSelect(selectedDate) {
    if (selectedDate) {
      // Preserve time when selecting a new date
      if (date) {
        selectedDate.setHours(
          date.getHours(),
          date.getMinutes(),
          0,
          0
        );
      }
      setDate(selectedDate);
      onChange?.(selectedDate);
    }
  }

  function handleTimeChange(type, value) {
    const newDate = new Date(date);
    
    if (type === "hour") {
      newDate.setHours(parseInt(value, 10), newDate.getMinutes(), 0, 0);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10), 0, 0);
    }
    
    setDate(newDate);
    onChange?.(newDate);
  }

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
            format(date, "PPP HH:mm")
          ) : (
            <span>Pick date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 24 }, (_, i) => i)
                  .map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() === hour
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("hour", hour.toString())
                      }
                    >
                      {hour.toString().padStart(2, "0")}
                    </Button>
                  ))}
              </div>
              <ScrollBar
                orientation="horizontal"
                className="sm:hidden"
              />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map(
                  (minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        date &&
                        date.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  )
                )}
              </div>
              <ScrollBar
                orientation="horizontal"
                className="sm:hidden"
              />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}