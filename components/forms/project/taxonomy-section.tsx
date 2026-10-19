"use client";

import { useQuery } from "convex/react";
import { useDebounce } from "hooks-ts";
import { Tag, X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { AlertBox } from "~/components/molecules/alert-box";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "~/convex/_generated/api";
import {
  hasTag,
  MAX_PROJECT_TAGS,
  MAX_TAG_LENGTH,
  normalizeTag,
} from "~/lib/tags";
import { cn } from "~/lib/utils";
import type { ProjectFormValues } from "./project-form";

const SUGGESTION_LIMIT = 6;
const SUGGESTION_DEBOUNCE_MS = 200;

export function TaxonomySection() {
  const { control } = useFormContext<ProjectFormValues>();
  const {
    field: { value: tags, onChange },
    fieldState: { error },
  } = useController({ control, name: "tags" });

  const [input, setInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const term = input.trim();
  const debouncedTerm = useDebounce(term, SUGGESTION_DEBOUNCE_MS);
  const results = useQuery(
    api.skills.searchSkills,
    debouncedTerm ? { q: debouncedTerm, limit: SUGGESTION_LIMIT } : "skip",
  );

  const isMax = tags.length >= MAX_PROJECT_TAGS;
  const suggestions = (results ?? []).filter((name) => !hasTag(tags, name));
  const showSuggestions = isOpen && term.length > 0 && !isMax;

  function removeTag(tag: string): void {
    onChange(tags.filter((current) => current !== tag));
    setHint(null);
  }

  function addTag(raw: string): void {
    const tag = normalizeTag(raw);
    setInput("");
    setIsOpen(false);
    setActiveIndex(-1);

    if (!tag) return;

    if (tag.length > MAX_TAG_LENGTH) {
      setHint(`Tags cannot exceed ${MAX_TAG_LENGTH} characters.`);
      return;
    }

    if (hasTag(tags, tag)) {
      setHint(`"${tag}" is already added.`);
      return;
    }

    if (tags.length >= MAX_PROJECT_TAGS) {
      setHint(`Maximum ${MAX_PROJECT_TAGS} tags per project.`);
      return;
    }

    setHint(null);
    onChange([...tags, tag]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const highlighted =
        activeIndex >= 0 ? suggestions[activeIndex] : undefined;
      addTag(highlighted ?? input);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "Backspace" && input === "" && tags.length > 0) {
      const last = tags[tags.length - 1];
      if (last) removeTag(last);
      return;
    }

    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-1 items-center gap-3 text-left">
          <div className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <Tag size={15} />
          </div>

          <CardTitle className="text-foreground truncate text-base">
            Tags{" "}
            {tags.length > 0 ? (
              <span className="text-muted-foreground font-thin">
                — {tags.length}/{MAX_PROJECT_TAGS}
              </span>
            ) : null}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {error?.message && (
          <AlertBox severity="error" heading={error.message} />
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-brand-primary/40 bg-brand-primary/15 text-foreground gap-1.5 py-1 pr-2 pl-3 text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remove ${tag}`}
                  className="text-muted-foreground hover:text-foreground rounded-full p-0.5 transition-colors hover:bg-white/10"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="relative">
          <label htmlFor="project-tag-input" className="sr-only">
            Add a tag
          </label>
          <Input
            id="project-tag-input"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="project-tag-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={
              showSuggestions && activeIndex >= 0
                ? `project-tag-option-${activeIndex}`
                : undefined
            }
            autoComplete="off"
            disabled={isMax}
            value={input}
            placeholder={
              isMax
                ? `Maximum of ${MAX_PROJECT_TAGS} tags reached`
                : "Type a tag and press Enter"
            }
            onChange={(event) => {
              setInput(event.target.value);
              setActiveIndex(-1);
              setHint(null);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsOpen(false)}
          />

          {showSuggestions && (
            <div
              id="project-tag-suggestions"
              role="listbox"
              className="border-border bg-popover absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border p-1 shadow-lg"
            >
              {results === undefined ? (
                <div className="text-muted-foreground px-3 py-2 text-sm">
                  Searching…
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-muted-foreground px-3 py-2 text-sm">
                  Press Enter to add “{normalizeTag(input)}”
                </div>
              ) : (
                suggestions.map((name, index) => (
                  <button
                    key={name}
                    type="button"
                    id={`project-tag-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => addTag(name)}
                    className={cn(
                      "text-foreground/80 hover:bg-accent hover:text-accent-foreground block w-full rounded-sm px-3 py-2 text-left text-sm transition-colors",
                      index === activeIndex &&
                        "bg-accent text-accent-foreground",
                    )}
                  >
                    {name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {hint && <p className="text-brand-danger-500 text-xs">{hint}</p>}

        <p className="text-muted-foreground text-xs">
          Up to {MAX_PROJECT_TAGS} tags, {MAX_TAG_LENGTH} characters each.
        </p>
      </CardContent>
    </Card>
  );
}
