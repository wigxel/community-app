"use client";
import React from "react";
import { SearchInput } from "../molecules/search-input";

// @todo: Integrate search function. url should be the source of truth
export function SearchBox() {
  const [_searchTerm, _setSearchTerm] = React.useState("");

  return (
    <div className="flex flex-col gap-2">
      <SearchInput />
      <div className="text-foreground mb-4 inline-flex items-center gap-2 px-[1.8em] text-xs">
        {/* @todo: Integrate this */}
        <span className="inline-block">Popular &nbsp;&nbsp;—&nbsp;&nbsp;</span>
        <span className="inline-flex gap-2">
          {["Web3", "E-commerce", "Blog", "Fintech"].map((tag) => {
            return (
              <span
                key={tag}
                className="hover:text-accent-foreground hover:bg-muted inline-block cursor-pointer rounded-sm p-1"
              >
                {tag}
              </span>
            );
          })}
        </span>
      </div>
    </div>
  );
}
