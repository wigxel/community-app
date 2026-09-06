"use client";
import { capitalize } from "effect/String";
import React from "react";
import type z from "zod/v4";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { timelineDate } from "~/lib/validators/schema";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => currentYear - i);

type TimelineDate = z.Infer<typeof timelineDate>;

function tsToMonthYear(val: TimelineDate): {
  month: string;
  year: string;
} {
  if (!val) return { month: "", year: "" };
  return {
    month: "month" in val ? val.month : "",
    year: val.year,
  };
}

function monthYearToTs(month: string, year: string): TimelineDate {
  if (!year) return null;
  if (!month) return { year };
  return { month, year };
}

export type TimelineSelectProps = {
  timeline: string;
  value: TimelineDate;
  onChange: (val: TimelineDate) => void;
};

export default function TimelineSelect({
  timeline,
  value,
  onChange,
}: TimelineSelectProps) {
  const { month, year } = tsToMonthYear(value);
  const [localMonth, setLocalMonth] = React.useState(month);
  const [localYear, setLocalYear] = React.useState(year);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const { month: m, year: y } = tsToMonthYear(value);
    setLocalMonth(m);
    setLocalYear(y);
    if (value === null) setError(null);
  }, [value]);

  const handleMonthChange = (nextMonth: string) => {
    const val = nextMonth === "unset" ? "" : nextMonth;
    setLocalMonth(val);
    if (!localYear && val) {
      setError("Please enter a year.");
      onChange(null);
    } else {
      setError(null);
      onChange(monthYearToTs(val, localYear));
    }
  };

  const handleYearChange = (nextYear: string) => {
    const val = nextYear === "unset" ? "" : nextYear;
    setLocalYear(val);
    setError(null);
    onChange(monthYearToTs(localMonth, val));
  };

  return (
    <div className="flex flex-1 gap-4 *:flex-1">
      <div className="flex flex-col">
        <Label
          htmlFor={`${timeline}_month`}
          className="text-muted-foreground mb-1 text-[10px] font-medium"
        >
          {capitalize(timeline)} month
        </Label>
        <Select value={localMonth || "unset"} onValueChange={handleMonthChange}>
          <SelectTrigger id={`${timeline}_month`}>
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unset">Select Month</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>

      <div className="flex flex-col">
        <Label
          htmlFor={`${timeline}_year`}
          className="text-muted-foreground mb-1 text-[10px] font-medium after:ml-0.5 after:content-['*']"
        >
          {capitalize(timeline)} year
        </Label>
        <Select value={localYear || "unset"} onValueChange={handleYearChange}>
          <SelectTrigger id={`${timeline}_year`}>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent className="max-h-[40vh]">
            <SelectItem value="unset">Select Year</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
