"use client";
import { Link as LinkIcon, X } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import type { z } from "zod";
import type { formSchema } from "~/app/dashboard/projects/edit/page";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const LINK_TAGS = [
  { value: "github", label: "GitHub" },
  { value: "live", label: "Live Demo" },
  { value: "figma", label: "Figma" },
  { value: "behance", label: "Behance" },
  { value: "docs", label: "Docs" },
  { value: "other", label: "Other" },
] as const;

const normalizeUrl = (val: string) => {
  if (!val) return val;
  if (val.startsWith("www.")) return `https://${val}`;
  return val;
};

interface LinkRowProps {
  projectIndex: number;
  linkIndex: number;
  control: Control<z.infer<typeof formSchema>>;
  remove: (i: number) => void;
  error: string | undefined;
}

export default function LinkRow({
  projectIndex,
  linkIndex,
  control,
  remove,
  error,
}: LinkRowProps) {
  return (
    <Controller
      control={control}
      name={`projects.${projectIndex}.link.${linkIndex}`}
      render={({ field }) => (
        <div>
          <div className="flex items-center gap-2">
            <Select
              value={field.value?.tag ?? "github"}
              onValueChange={(val) =>
                field.onChange({ ...field.value, tag: val })
              }
            >
              <SelectTrigger className="w-32 shrink-0 border-white/15 bg-white/5 text-sm text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/15 bg-slate-900 text-white">
                {LINK_TAGS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex flex-1 items-center">
              <LinkIcon
                size={13}
                className="absolute left-3 shrink-0 text-white/30"
              />
              <Input
                value={field.value?.value ?? ""}
                onChange={(e) =>
                  field.onChange({
                    ...field.value,
                    value: normalizeUrl(e.target.value),
                  })
                }
                placeholder="https://..."
                className="border-white/15 bg-white/5 pl-8 text-sm text-white placeholder:text-white/30"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-white/30 hover:bg-red-400/10 hover:text-red-400"
              onClick={() => remove(linkIndex)}
            >
              <X size={13} />
            </Button>
          </div>
          {error && (
            <p className="text-xs font-medium text-red-400 ml-34">{error}</p>
          )}
        </div>
      )}
    />
  );
}
