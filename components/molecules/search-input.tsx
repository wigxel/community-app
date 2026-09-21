"use client";
import { useQueryState } from "nuqs";
import { SearchIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import type { SearchConfig } from "~/lib/search-config";
import { cn } from "~/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput(props: SearchInputProps) {
  const {
    value,
    onChange,
    onSearch,
    placeholder = "What you looking for?",
    className,
  } = props;

  return (
    <label
      className={cn(
        "bg-muted/50 focus-within:bg-muted flex items-center gap-4 rounded-xl py-[0.4rem] ps-4 pe-[0.4em]",
        className,
      )}
    >
      <SearchIcon className="text-muted-foreground size-4.5" />
      <div className="relative flex-1 self-stretch">
        <input
          type="text"
          className="absolute inset-0 text-base outline-none"
          placeholder={placeholder}
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
  placeholder?: string;
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
