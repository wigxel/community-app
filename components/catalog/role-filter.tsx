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
    <div className="max-w-md w-full flex items-center border border-white/20 rounded-2xl overflow-hidden">
      <span className="text-nowrap p-4 text-sm font-semibold text-white ">
        Filter by role
      </span>
      <Select
        value={filter}
        onValueChange={(value) => setFilter(() => (value !== "#" ? value : ""))}
      >
        <SelectTrigger className="w-full grow rounded-none border-0 p-4 h-full bg-white text-zinc-700">
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
