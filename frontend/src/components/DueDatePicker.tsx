"use client";

import { useState } from "react";
import { Calendar, Clock, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isToday, isPast, isTomorrow, isThisWeek } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DueDatePickerProps {
  cardId: string;
  dueDate: Date | null;
  onUpdate: (dueDate: Date | null) => void;
}

export function DueDatePicker({ cardId, dueDate, onUpdate }: DueDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dueDate ? new Date(dueDate) : undefined
  );

  const getDueDateStatus = (date: Date | null) => {
    if (!date) return null;
    
    const now = new Date();
    const due = new Date(date);
    
    if (isPast(due) && !isToday(due)) {
      return { label: "Overdue", color: "bg-red-500", textColor: "text-red-700" };
    }
    if (isToday(due)) {
      return { label: "Due today", color: "bg-yellow-500", textColor: "text-yellow-700" };
    }
    if (isTomorrow(due)) {
      return { label: "Due tomorrow", color: "bg-blue-500", textColor: "text-blue-700" };
    }
    if (isThisWeek(due)) {
      return { label: "This week", color: "bg-green-500", textColor: "text-green-700" };
    }
    return { label: "Upcoming", color: "bg-gray-500", textColor: "text-gray-700" };
  };

  const handleSave = () => {
    if (selectedDate) {
      onUpdate(selectedDate);
      setOpen(false);
      toast.success("Due date updated");
    }
  };

  const handleRemove = () => {
    setSelectedDate(undefined);
    onUpdate(null);
    setOpen(false);
    toast.success("Due date removed");
  };

  const status = dueDate ? getDueDateStatus(new Date(dueDate)) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {dueDate ? (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 h-8",
              status?.textColor,
              isPast(new Date(dueDate)) && !isToday(new Date(dueDate))
                ? "border-red-300 bg-red-50"
                : ""
            )}
          >
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">
              {format(new Date(dueDate), "MMM d")}
            </span>
            {status && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                status.color,
                "text-white"
              )}>
                {status.label}
              </span>
            )}
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2 h-8">
            <Clock className="h-4 w-4" />
            Due Date
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-semibold text-sm">Due Date</h4>
        </div>
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
          className="rounded-md"
        />
        <div className="p-3 border-t flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={!selectedDate}>
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
          {dueDate && (
            <Button size="sm" variant="destructive" onClick={handleRemove}>
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="ml-auto"
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
