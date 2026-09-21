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
    <div className="flex gap-2">
      <Select
        value={filter}
        onValueChange={(value) => setFilter(() => (value !== "#" ? value : ""))}
      >
        <SelectTrigger>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="#">All roles</SelectItem>
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
