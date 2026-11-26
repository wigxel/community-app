"use client";
import type { Editor, Range } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";
import {
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  TextQuote,
} from "lucide-react";
import React from "react";
import { cn } from "~/lib/utils";

interface SlashItem {
  title: string;
  description: string;
  icon: React.ElementType;
  keywords: string[];
  command: (props: { editor: Editor; range: Range }) => void;
}

const ITEMS: SlashItem[] = [
  {
    title: "Heading",
    description: "Large section heading",
    icon: Heading2,
    keywords: ["h2", "title"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Subheading",
    description: "Smaller section heading",
    icon: Heading3,
    keywords: ["h3"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: "Bulleted list",
    description: "Simple bullet list",
    icon: List,
    keywords: ["ul", "unordered"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    description: "Ordered list",
    icon: ListOrdered,
    keywords: ["ol", "ordered"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Quote",
    description: "Block quote",
    icon: TextQuote,
    keywords: ["blockquote"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code block",
    description: "Fenced code block",
    icon: Code,
    keywords: ["pre"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "Horizontal rule",
    icon: Minus,
    keywords: ["hr", "line"],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Insert from URL",
    icon: ImageIcon,
    keywords: ["picture", "photo"],
    command: ({ editor, range }) => {
      const url = window.prompt("Image URL");
      if (!url) return;
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setImage({ src: url })
        .createParagraphNear()
        .run();
    },
  },
];

function filterItems(query: string): SlashItem[] {
  const needle = query.toLowerCase().trim();
  if (needle === "") return ITEMS;
  return ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(needle) ||
      item.keywords.some((keyword) => keyword.startsWith(needle)),
  );
}

interface SlashMenuProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

/** Rendered into a fixed-position popup by the Suggestion plugin. */
const SlashMenu = React.forwardRef<
  { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
  SlashMenuProps
>(function SlashMenu(props, ref) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Clamp instead of resetting on query change: typing narrows the list
  // while the cursor may sit past the new end.
  const activeIndex = Math.min(selectedIndex, props.items.length - 1);

  const select = (index: number) => {
    const item = props.items[index];
    if (item) props.command(item);
  };

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (index) =>
            (Math.min(index, props.items.length - 1) + props.items.length - 1) %
            props.items.length,
        );
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex(
          (index) =>
            (Math.min(index, props.items.length - 1) + 1) % props.items.length,
        );
        return true;
      }
      if (event.key === "Enter") {
        select(activeIndex);
        return true;
      }
      return false;
    },
  }));

  if (props.items.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm shadow-lg">
        No commands
      </div>
    );
  }

  return (
    <div className="bg-background w-64 overflow-hidden rounded-lg border shadow-lg">
      {props.items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 text-left",
              index === activeIndex ? "bg-white/10" : "hover:bg-white/5",
            )}
            onClick={() => select(index)}
          >
            <span className="text-brand-primary bg-brand-black-450 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Icon size={15} />
            </span>
            <span className="flex flex-col">
              <span className="text-foreground text-sm">{item.title}</span>
              <span className="text-muted-foreground text-xs">
                {item.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
});

function positionPopup(popup: HTMLElement, rect: DOMRect) {
  const MARGIN = 8;
  const height = popup.offsetHeight;
  const width = popup.offsetWidth;

  // Prefer below the cursor; flip above when it would run off the bottom.
  const fitsBelow =
    rect.bottom + MARGIN + height <= window.innerHeight - MARGIN;
  const top = fitsBelow
    ? rect.bottom + MARGIN
    : Math.max(MARGIN, rect.top - MARGIN - height);

  // Keep the left edge inside the viewport.
  const left = Math.min(
    Math.max(MARGIN, rect.left),
    window.innerWidth - MARGIN - width,
  );

  popup.style.top = `${top}px`;
  popup.style.left = `${left}px`;
}

const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    let popup: HTMLElement | null = null;
    let renderer: ReactRenderer<
      { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
      SlashMenuProps
    > | null = null;
    let lastRect: DOMRect | null = null;

    const reposition = () => {
      if (popup && lastRect) positionPopup(popup, lastRect);
    };

    // Typing repositions via onUpdate; scroll/resize of any container needs
    // its own listener (capture phase catches inner scroll containers too).
    const onScrollOrResize = () => requestAnimationFrame(reposition);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    const destroyPopup = () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      renderer?.destroy();
      popup?.remove();
      renderer = null;
      popup = null;
      lastRect = null;
    };

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        items: ({ query }) => filterItems(query),
        command: ({ editor, range, props }) => props.command({ editor, range }),
        render: () => ({
          onStart: (props: SuggestionProps<SlashItem>) => {
            renderer = new ReactRenderer(SlashMenu, {
              props,
              editor: props.editor,
            });
            popup = document.createElement("div");
            popup.style.position = "fixed";
            popup.style.zIndex = "50";
            document.body.appendChild(popup);
            popup.appendChild(renderer.element);
            lastRect = props.clientRect?.() ?? null;
            reposition();
          },
          onUpdate: (props) => {
            renderer?.updateProps(props);
            lastRect = props.clientRect?.() ?? null;
            // rAF so the (possibly re-rendered) menu height is measured
            // after React commits.
            requestAnimationFrame(reposition);
          },
          onKeyDown: (props) => {
            if (props.event.key === "Escape") {
              // Deleting the query deactivates the suggestion, which fires
              // onExit and tears the popup down.
              this.editor.commands.deleteRange(props.range);
              return true;
            }
            return renderer?.ref?.onKeyDown(props) ?? false;
          },
          onExit: destroyPopup,
        }),
      }),
    ];
  },
});

export default SlashCommand;
