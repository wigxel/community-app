"use client";
import React from "react";
import { SearchIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function SearchInput() {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <label className="bg-muted/50 focus-within:bg-muted flex items-center gap-4 rounded-xl py-[0.4rem] ps-4 pe-[0.4em]">
      <SearchIcon className="text-muted-foreground size-4.5" />
      <div className="relative flex-1 self-stretch">
        <input
          type="text"
          className="absolute inset-0 text-base outline-none"
          placeholder="What you looking for?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Button size="lg" className="rounded-xl">
        Search
      </Button>
    </label>
  );
}

// @todo: Integrate this component where it's referenced. suggest more properties
export function QueryBasedSearchInput(props: {
  config: { key: string };
  placeholder: string;
  className?: string;
}) {
  const { config, placeholder, className } = props;
  const [searchTerm, setSearchTerm] = React.useState("");

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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Button size="lg" className="rounded-xl">
        Search
      </Button>
    </label>
  );
}
