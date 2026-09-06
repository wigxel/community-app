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
  const { month, year } = React.useMemo(() => tsToMonthYear(value), [value]);

  // pending: tracks a two-part selection where month is picked but year is not yet set
  const [pendingMonth, setPendingMonth] = React.useState<string>("");

  // derive display value directly from `value` — no stale local state
  const displayMonth = month || "";
  const displayYear = year || "";

  const handleMonthChange = (nextMonth: string) => {
    const val = nextMonth === "unset" ? "" : nextMonth;
    if (!displayYear && val) {
      // year not set yet — hold month in pending, wait for year pick
      setPendingMonth(val);
      onChange(null);
    } else {
      setPendingMonth("");
      onChange(monthYearToTs(val, displayYear));
    }
  };

  const handleYearChange = (nextYear: string) => {
    const val = nextYear === "unset" ? "" : nextYear;
    // if a month is pending from a prior pick, pair it with this year
    const monthToUse = pendingMonth || displayMonth;
    setPendingMonth("");
    onChange(monthYearToTs(monthToUse, val));
  };

  // if value is reset to null, clear pending + error
  React.useEffect(() => {
    if (value === null) {
      setPendingMonth("");
    }
  }, [value]);

  return (
    <div className="flex flex-1 gap-4 *:flex-1">
      <div className="flex flex-col">
        <Label
          htmlFor={`${timeline}_month`}
          className="text-muted-foreground mb-1 text-[10px] font-medium"
        >
          {capitalize(timeline)} month
        </Label>
        <Select
          value={displayMonth || "unset"}
          onValueChange={handleMonthChange}
        >
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
      </div>

      <div className="flex flex-col">
        <Label
          htmlFor={`${timeline}_year`}
          className="text-muted-foreground mb-1 text-[10px] font-medium after:ml-0.5 after:content-['*']"
        >
          {capitalize(timeline)} year
        </Label>
        <Select value={displayYear || "unset"} onValueChange={handleYearChange}>
          <SelectTrigger id={`${timeline}_year`}>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent className="max-h-[40vh]">
            <SelectItem value="unset">Select Year</SelectItem>
            {YEARS.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
