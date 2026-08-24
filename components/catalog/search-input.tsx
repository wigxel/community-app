"use client";

import { Search } from "lucide-react";
import { useQueryState } from "nuqs";

export function SearchInput() {
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    throttleMs: 500,
  });

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/50">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="search"
        className="block w-full rounded-2xl border border-white/20 bg-white/10 p-4 pl-10 text-sm text-white placeholder-white/50 backdrop-blur-sm transition-all hover:bg-white/20 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Search profiles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
