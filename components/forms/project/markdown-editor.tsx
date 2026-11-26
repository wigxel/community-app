"use client";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import React from "react";
import { useController } from "react-hook-form";
import { MarkdownRenderer } from "~/components/markdown/markdown-renderer";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { countWords, MAX_PROJECT_DESCRIPTION_WORDS } from "~/lib/markdown";
import { cn } from "~/lib/utils";

interface MarkdownEditorProps {
  name: string;
  label?: string;
}

/** A toolbar insert: surround the selection, or insert at the cursor. */
function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after = before,
): { value: string; cursor: number } {
  const selected = value.slice(start, end) || "text";
  const next =
    value.slice(0, start) + before + selected + after + value.slice(end);

  return { value: next, cursor: start + before.length + selected.length };
}

function toggleLinePrefix(
  value: string,
  start: number,
  end: number,
  prefix: string,
): { value: string; cursor: number } {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = value.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = value.length;

  const fullLine = value.slice(lineStart, lineEnd);
  const alreadyPrefixed = fullLine.startsWith(prefix);
  const updated = alreadyPrefixed
    ? fullLine.slice(prefix.length)
    : prefix + fullLine;

  return {
    value: value.slice(0, lineStart) + updated + value.slice(lineEnd),
    cursor: lineStart + updated.length,
  };
}

const LINE_PREFIXES: Record<string, string> = {
  h2: "## ",
  h3: "### ",
  ul: "- ",
  ol: "1. ",
  quote: "> ",
};

export function MarkdownEditor({
  name,
  label = "Full description",
}: MarkdownEditorProps) {
  const { field, fieldState } = useController({ name });
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const apply = (
    transform: (
      value: string,
      start: number,
      end: number,
    ) => { value: string; cursor: number },
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { value, cursor } = transform(
      field.value ?? "",
      textarea.selectionStart,
      textarea.selectionEnd,
    );
    field.onChange(value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const insert = (before: string, after = before) =>
    apply((value, start, end) =>
      wrapSelection(value, start, end, before, after),
    );

  const prefixLine = (prefix: string) =>
    apply((value, start, end) => toggleLinePrefix(value, start, end, prefix));

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.metaKey && !event.ctrlKey) return;

    const shortcuts: Record<string, () => void> = {
      b: () => insert("**"),
      i: () => insert("*"),
      k: () => insert("[", "](https://)"),
    };
    const handler = shortcuts[event.key.toLowerCase()];
    if (handler) {
      event.preventDefault();
      handler();
    }
  };

  const value = field.value ?? "";
  const words = countWords(value);
  const overLimit = words > MAX_PROJECT_DESCRIPTION_WORDS;

  const toolbar: Array<{
    icon: React.ElementType;
    title: string;
    onClick: () => void;
  }> = [
    { icon: Bold, title: "Bold (⌘B)", onClick: () => insert("**") },
    { icon: Italic, title: "Italic (⌘I)", onClick: () => insert("*") },
    {
      icon: Heading2,
      title: "Heading",
      onClick: () => prefixLine(LINE_PREFIXES.h2),
    },
    {
      icon: Heading3,
      title: "Subheading",
      onClick: () => prefixLine(LINE_PREFIXES.h3),
    },
    {
      icon: Link2,
      title: "Link (⌘K)",
      onClick: () => insert("[", "](https://)"),
    },
    { icon: Code, title: "Code", onClick: () => insert("`") },
    {
      icon: List,
      title: "Bulleted list",
      onClick: () => prefixLine(LINE_PREFIXES.ul),
    },
    {
      icon: ListOrdered,
      title: "Numbered list",
      onClick: () => prefixLine(LINE_PREFIXES.ol),
    },
    {
      icon: Quote,
      title: "Quote",
      onClick: () => prefixLine(LINE_PREFIXES.quote),
    },
    {
      icon: Image,
      title: "Image",
      onClick: () => insert("![alt text](https://)"),
    },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-muted-foreground text-sm font-medium">
          {label}
        </span>
      )}
      <Tabs defaultValue="write">
        <div className="flex items-center justify-between border-b border-white/10">
          <TabsList className="h-auto bg-transparent p-0">
            <TabsTrigger
              value="write"
              className="data-[state=active]:border-brand-primary data-[state=active]:text-foreground rounded-none border-0 border-b-2 pb-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Write
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="data-[state=active]:border-brand-primary data-[state=active]:text-foreground rounded-none border-0 border-b-2 pb-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-0.5 pb-1">
            {toolbar.map(({ icon: Icon, title, onClick }) => (
              <Button
                key={title}
                type="button"
                variant="ghost"
                size="icon"
                title={title}
                aria-label={title}
                className="text-foreground/60 hover:text-foreground h-7 w-7"
                onClick={onClick}
              >
                <Icon size={14} />
              </Button>
            ))}
          </div>
        </div>

        <TabsContent value="write">
          <Textarea
            {...field}
            ref={(node) => {
              field.ref(node);
              textareaRef.current = node;
            }}
            onKeyDown={onKeyDown}
            placeholder={
              "Write the long-form project description in Markdown.\n\n## What it does\n## How you built it\n## What you learned"
            }
            className="min-h-64 border-white/15 bg-white/5 font-mono text-sm placeholder:text-white/30"
            rows={10}
          />
        </TabsContent>

        <TabsContent value="preview">
          {value.trim() === "" ? (
            <p className="min-h-64 rounded-md border border-white/10 p-4 text-sm text-white/30">
              Nothing to preview yet — write something in the Write tab.
            </p>
          ) : (
            <div className="min-h-64 rounded-md border border-white/10 bg-white/5 p-4">
              <MarkdownRenderer>{value}</MarkdownRenderer>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-xs",
            overLimit ? "text-red-400" : "text-foreground/30",
          )}
        >
          {words.toLocaleString()} /{" "}
          {MAX_PROJECT_DESCRIPTION_WORDS.toLocaleString()} words
          {overLimit
            ? ` — ${words - MAX_PROJECT_DESCRIPTION_WORDS} over the limit`
            : ""}
        </p>
        {fieldState.error?.message && (
          <p className="text-destructive text-xs">{fieldState.error.message}</p>
        )}
      </div>
    </div>
  );
}
