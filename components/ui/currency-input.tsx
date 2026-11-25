"use client";

import type * as React from "react";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

/**
 * Naira input that formats with thousand separators as you type. The value
 * contract is digits only — "150000" formats to "₦150,000".
 * ponytail: naive formatter, caret jumps to the end mid-edit — acceptable
 * for short amounts; swap for a caret-preserving lib if that ever annoys.
 */
interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  value: string;
  onValueChange: (digits: string) => void;
}

export function CurrencyInput(props: CurrencyInputProps) {
  const { value, onValueChange, className, ...restProps } = props;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onValueChange(e.target.value.replace(/[^\d]/g, ""));
  }

  return (
    <div className="relative">
      <span
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm"
      >
        ₦
      </span>
      <Input
        type="text"
        inputMode="numeric"
        className={cn("pl-7", className)}
        value={
          value ? new Intl.NumberFormat("en-NG").format(Number(value)) : ""
        }
        onChange={handleChange}
        {...restProps}
      />
    </div>
  );
}
