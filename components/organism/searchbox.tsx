"use client";
import { useQueryState } from "nuqs";
import type { SearchConfig } from "~/lib/search-config";
import { SearchInput } from "../molecules/search-input";

type SearchBoxProps = {
  config: SearchConfig;
  popularTags?: string[];
  onSearch: (value: string) => void;
  placeholder?: string;
};

const DEFAULT_TAGS = ["Web3", "E-commerce", "Blog", "Fintech"];

export function SearchBox({
  config,
  popularTags = DEFAULT_TAGS,
  onSearch,
  placeholder = "What you looking for?",
}: SearchBoxProps) {
  const { queryKey, throttleMs = 500 } = config;
  const [search, setSearch] = useQueryState(queryKey, {
    defaultValue: "",
    shallow: false,
    throttleMs,
  });

  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        value={search ?? ""}
        onChange={setSearch}
        onSearch={onSearch}
        placeholder={placeholder}
      />
      <div className="text-foreground mb-4 inline-flex items-center gap-2 px-[1.8em] text-xs">
        <span className="inline-block">Popular &nbsp;&nbsp;—&nbsp;&nbsp;</span>
        <span className="inline-flex gap-2">
          {popularTags.map((tag) => (
            <span
              key={tag}
              className="hover:text-accent-foreground hover:bg-muted inline-block cursor-pointer rounded-sm p-1"
            >
              {tag}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
