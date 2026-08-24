"use client";

import { useQueryState } from "nuqs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Title } from "~/types/models";

interface RoleFilterProps {
  titles: Title[];
}

export function RoleFilter({ titles }: RoleFilterProps) {
  const [filter, setFilter] = useQueryState("role", {
    defaultValue: "",
    shallow: false,
  });

  return (
    <div className="flex w-full max-w-md items-center overflow-hidden rounded-2xl border border-white/20">
      <span className="p-4 text-sm font-semibold text-nowrap text-white">
        Filter by role
      </span>
      <Select
        value={filter}
        onValueChange={(value) => setFilter(() => (value !== "#" ? value : ""))}
      >
        <SelectTrigger className="h-full w-full grow rounded-none border-0 bg-white p-4 text-zinc-700">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="#">All</SelectItem>
          {titles.map(({ name }) => (
            <SelectItem key={name} value={name} className="capitalize">
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
