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
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/50">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="search"
        className="block w-full p-4 pl-10 text-sm text-white border border-white/20 rounded-2xl bg-white/10 focus:ring-blue-500 focus:border-blue-500 placeholder-white/50 backdrop-blur-sm transition-all hover:bg-white/20"
        placeholder="Search profiles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}
