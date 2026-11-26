"use client";
import { Button } from "@hyperbridge/ui";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code, Italic, Link2, Strikethrough } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { countWords, MAX_PROJECT_DESCRIPTION_WORDS } from "~/lib/markdown";
import { cn } from "~/lib/utils";
import type { ProjectFormValues } from "./project-form";
import SlashCommand from "./slash-command";

interface FullDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function BubbleButton(props: {
  title: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = props.icon;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={props.title}
      aria-label={props.title}
      className={cn(
        "text-foreground/60 hover:text-foreground h-8 w-8",
        props.active && "text-foreground bg-white/10",
      )}
      onClick={props.onClick}
    >
      <Icon size={15} />
    </Button>
  );
}

export function FullDescriptionDialog(props: FullDescriptionDialogProps) {
  const { open, onOpenChange } = props;
  const { watch, setValue } = useFormContext<ProjectFormValues>();
  const saved = watch("longDescription") ?? "";
  const title = watch("title");
  const [draft, setDraft] = React.useState(saved);

  const editor = useEditor({
    extensions: [StarterKit, Image, Markdown, SlashCommand],
    contentType: "markdown",
    content: saved,
    onUpdate: ({ editor }) => setDraft(editor.getMarkdown()),
  });

  const words = countWords(draft);
  const overLimit = words > MAX_PROJECT_DESCRIPTION_WORDS;

  const close = () => onOpenChange(false);

  function save() {
    // Read from the editor itself — `draft` only updates on keystrokes, so
    // an untouched save would otherwise commit the empty initial value.
    setValue("longDescription", editor?.getMarkdown() ?? draft, {
      shouldDirty: true,
    });
    close();
  }

  if (!editor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        onEscapeKeyDown={(event) => event.preventDefault()}
        className="data-[state=open]:zoom-in-100! data-[state=open]:slide-in-from-left-0! data-[state=open]:slide-in-from-bottom-16! data-[state=closed]:zoom-out-100! data-[state=closed]:slide-out-to-left-0! data-[state=closed]:slide-out-to-bottom-16! inset-0! flex h-dvh! max-w-none! translate-x-0! translate-y-0! flex-col rounded-none! p-0! sm:rounded-none!"
      >
        <DialogHeader className="flex! flex-row items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <DialogTitle>{title || "Full description"}</DialogTitle>
            <DialogDescription>
              What readers see on the project page.
            </DialogDescription>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <p
              className={cn(
                "text-xs",
                overLimit ? "text-red-400" : "text-muted-foreground",
              )}
            >
              {words.toLocaleString()} /{" "}
              {MAX_PROJECT_DESCRIPTION_WORDS.toLocaleString()} words
              {overLimit
                ? ` — ${words - MAX_PROJECT_DESCRIPTION_WORDS} over the limit`
                : ""}
            </p>
            <Button
              type="button"
              className="h-8 py-0 text-sm"
              variant="ghost"
              onClick={close}
            >
              Cancel
            </Button>
            <Button type="button" className="h-8 py-0 text-sm" onClick={save}>
              Save
            </Button>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto">
          <BubbleMenu
            editor={editor}
            shouldShow={({ state }) => !state.selection.empty}
            className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-neutral-900 p-1 shadow-lg"
          >
            <BubbleButton
              title="Bold (⌘B)"
              icon={Bold}
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <BubbleButton
              title="Italic (⌘I)"
              icon={Italic}
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <BubbleButton
              title="Strikethrough"
              icon={Strikethrough}
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <BubbleButton
              title="Inline code"
              icon={Code}
              active={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
            />
            <BubbleButton
              title="Link"
              icon={Link2}
              active={editor.isActive("link")}
              onClick={() => {
                if (editor.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                  return;
                }
                const url = window.prompt("Link URL");
                if (!url) return;
                editor.chain().focus().setLink({ href: url }).run();
              }}
            />
          </BubbleMenu>

          <EditorContent
            editor={editor}
            className="prose prose-invert mx-auto min-w-[clamp(648px,60ch,80vw)] px-6 py-4 [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:min-w-full! [&_.ProseMirror]:outline-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
