"use client";
import React from "react";
import type { z } from "zod";
import type { timelineDate } from "~/app/dashboard/projects/edit/page";
import { Label } from "~/components/ui/label";

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
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

type TimelineDate = z.infer<typeof timelineDate>;

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

export default function TimelineSelect({
  timeline,
  value,
  onChange,
}: {
  timeline: string;
  value: TimelineDate;
  onChange: (val: TimelineDate) => void;
}) {
  const { month, year } = tsToMonthYear(value);
  const [localMonth, setLocalMonth] = React.useState(month);
  const [localYear, setLocalYear] = React.useState(year);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value === null) {
      setLocalMonth("");
      setLocalYear("");
      setError(null);
    }
  }, [value]);

  const handleMonthChange = (nextMonth: string) => {
    setLocalMonth(nextMonth);
    if (!localYear && nextMonth) {
      setError("Please enter a year.");
      onChange(null);
    } else {
      setError(null);
      onChange(monthYearToTs(nextMonth, localYear));
    }
  };

  const handleYearChange = (nextYear: string) => {
    setLocalYear(nextYear);
    setError(null);
    onChange(monthYearToTs(localMonth, nextYear));
  };

  return (
    <div className="flex flex-1 gap-2.5 *:w-full">
      <div className="flex flex-col">
        <Label
          htmlFor={`${timeline}_month`}
          className="uppercase text-white/50 text-[10px] font-medium mb-1"
        >
          {timeline} Month
        </Label>
        <select
          id={`${timeline}_month`}
          value={localMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="w-full rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
        >
          <option value="" className="bg-neutral-900" />
          {MONTHS.map((m) => (
            <option key={m} value={m} className="bg-neutral-900">
              {m}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
      <div className="flex flex-col">
        <Label
          htmlFor={`${timeline}_year`}
          className="uppercase text-white/50 text-[10px] font-medium mb-1 after:content-['*'] after:ml-0.5"
        >
          {timeline} Year
        </Label>
        <select
          id={`${timeline}_year`}
          value={localYear}
          onChange={(e) => handleYearChange(e.target.value)}
          className="w-full rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
        >
          <option value="" className="bg-neutral-900" />
          {YEARS.map((y) => (
            <option key={y} value={String(y)} className="bg-neutral-900">
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
