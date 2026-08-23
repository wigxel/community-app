"use client";

import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

type Skill = {
  _id: string;
  name: string;
};

type SkillsSelectProps = {
  skills: Skill[];
  value: string[];
  onChange: (ids: string[]) => void;
};

export function SkillsSelect({ skills, value, onChange }: SkillsSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedSkills = skills.filter((s) => value.includes(s._id));
  const availableSkills = skills.filter(
    (s) =>
      !value.includes(s._id) &&
      s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addSkill = (id: string) => {
    onChange([...value, id]);
  };

  const removeSkill = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div className="space-y-3">
      {/* Selected skills */}
      {selectedSkills.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wider text-white/50 uppercase">
            Selected ({selectedSkills.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <Badge
                key={skill._id}
                variant="outline"
                className="gap-1.5 border-blue-400/40 bg-blue-500/20 py-1 pr-2 pl-3 text-sm text-blue-100"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill._id)}
                  aria-label={`Remove ${skill.name}`}
                  className="rounded-full p-0.5 text-blue-300 transition-colors hover:bg-blue-400/30 hover:text-white"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/40">No skills selected yet.</p>
      )}

      {/* Dropdown trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white",
              open && "border-white/30 text-white",
            )}
          >
            <span>
              {availableSkills.length === 0 &&
              selectedSkills.length === skills.length
                ? "All skills selected"
                : "Add a skill..."}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                "text-white/50 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-(--radix-popover-trigger-width) border-white/20 bg-[#1a1f2e] p-0"
          align="start"
        >
          {/* Search */}
          <div className="border-b border-white/10 p-2">
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/40"
            />
          </div>

          {/* Skill list */}
          <ul className="max-h-52 overflow-y-auto p-1">
            {availableSkills.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-white/40">
                {search
                  ? `No results for "${search}"`
                  : "No more skills to add"}
              </li>
            ) : (
              availableSkills.map((skill) => (
                <li key={skill._id}>
                  <button
                    type="button"
                    onClick={() => {
                      addSkill(skill._id);
                      setSearch("");
                    }}
                    className="w-full rounded-sm px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {skill.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
