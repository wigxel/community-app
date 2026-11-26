"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { SearchIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import type { SearchConfig } from "~/lib/search-config";
import { cn } from "~/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  /** A list of placeholders cycles through them with an animation. */
  placeholder?: string | string[];
  className?: string;
};

const PLACEHOLDER_INTERVAL_MS = 3000;
const ENTER_DURATION_S = 0.3;
// One sweep per placeholder: starts after it slides in and finishes before
// the next rotation, leaving a short rest on the fully-revealed text.
const SHIMMER_DURATION_S = 1.8;

function useRotatingIndex(length: number, paused: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (paused || length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % length),
      PLACEHOLDER_INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [length, paused]);

  return index % Math.max(length, 1);
}

export function SearchInput(props: SearchInputProps) {
  const {
    value,
    onChange,
    onSearch,
    placeholder = "What you looking for?",
    className,
  } = props;

  const placeholders = Array.isArray(placeholder) ? placeholder : [placeholder];
  const reduceMotion = useReducedMotion();
  const index = useRotatingIndex(placeholders.length, value.length > 0);
  const current = placeholders[index] ?? "";

  return (
    <label
      className={cn(
        "focus-within:bg-muted flex items-center gap-4 rounded-xl bg-[hsl(from_var(--muted)_h_s_12%)] py-[0.4rem] ps-4 pe-[0.4em]",
        className,
      )}
    >
      <SearchIcon className="text-muted-foreground size-4.5" />
      <div className="relative flex-1 self-stretch overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {value.length === 0 && (
            <motion.span
              key={current}
              aria-hidden
              className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center text-base"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: ENTER_DURATION_S, ease: "easeOut" }}
            >
              <motion.span
                className="truncate bg-[linear-gradient(90deg,var(--muted-foreground)_0%,var(--muted-foreground)_40%,var(--foreground)_50%,var(--muted-foreground)_60%,var(--muted-foreground)_100%)] bg-size-[300%_100%] bg-clip-text text-transparent"
                initial={{ backgroundPosition: "100% 0" }}
                animate={
                  reduceMotion ? undefined : { backgroundPosition: "0% 0" }
                }
                transition={{
                  delay: ENTER_DURATION_S,
                  duration: SHIMMER_DURATION_S,
                  ease: "easeInOut",
                }}
              >
                {current}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
        <input
          type="text"
          aria-label={current}
          className="absolute inset-0 text-base outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange(value);
              onSearch(value);
            }
          }}
        />
      </div>

      <Button size="lg" className="rounded-xl" onClick={() => onSearch(value)}>
        Search
      </Button>
    </label>
  );
}

type QueryBasedSearchInputProps = {
  config: SearchConfig;
  placeholder?: string | string[];
  className?: string;
};

export function QueryBasedSearchInput(props: QueryBasedSearchInputProps) {
  const { config, placeholder = "What you looking for?", className } = props;

  const { queryKey, throttleMs = 500 } = config;
  const [search, setSearch] = useQueryState(queryKey, {
    defaultValue: "",
    shallow: false,
    throttleMs,
  });

  return (
    <SearchInput
      value={search ?? ""}
      onChange={setSearch}
      onSearch={setSearch}
      placeholder={placeholder}
      className={className}
    />
  );
}
