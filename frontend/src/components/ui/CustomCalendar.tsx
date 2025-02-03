"use client";
import * as React from "react";
import { Calendar as ShadCNCalendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  highlightedDates?: Date[]; // Custom prop to highlight dates
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ highlightedDates = [], selected, onSelect }) => {
  // Convert highlightedDates to a Set of date strings (for easy lookup)
  const highlightedDatesSet = new Set(highlightedDates.map(date => date.toDateString()));

  return (
    <ShadCNCalendar
      mode="single"
      selected={selected}
      onSelect={onSelect}
      className="relative"
      modifiers={{ highlighted: (date) => highlightedDatesSet.has(date.toDateString()) }}
      modifiersClassNames={{ highlighted: "bg-yellow-300 text-black rounded-full" }}
    />
  );
};

export default CustomCalendar;
