"use client";
import { IconButton } from "@hyperbridge/ui";
import { GlobeIcon, GripVertical, MinusIcon } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { type Control, Controller } from "react-hook-form";
import { Behance, Figma, Github, LinkedIn } from "~/components/icons";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { ProjectFormValues } from "./project-form";

const LINK_TAGS = [
  {
    prefix: "github.com/",
    value: "github",
    label: "GitHub",
    icon: <Github size={"1em"} />,
    placeholder: "username/project",
  },
  {
    prefix: "figma.com/",
    value: "figma",
    label: "Figma",
    icon: <Figma size={"1em"} />,
    placeholder: "project-id",
  },
  {
    prefix: "behance.com/",
    value: "behance",
    label: "Behance",
    icon: <Behance size={"1em"} />,
    placeholder: "project-id",
  },
  {
    prefix: "linkedin.com/",
    value: "linkedin",
    label: "LinkedIn",
    icon: <LinkedIn size={"1em"} />,
    placeholder: "in/username or company/name",
  },
  {
    prefix: "https://",
    value: "other",
    label: "Other",
    icon: <GlobeIcon size={"1em"} />,
    placeholder: "www.somewhere.com",
  },
] as const;

const normalizeUrl = (val: string) => {
  if (!val) return val;
  if (val.startsWith("www.")) return `https://${val}`;
  return val;
};

const MATCHABLE_HOSTS = [
  "github.com",
  "figma.com",
  "behance.net",
  "linkedin.com",
];

const HOST_TAG_MAP: Record<
  string,
  "github" | "figma" | "behance" | "linkedin"
> = {
  "github.com": "github",
  "figma.com": "figma",
  "behance.net": "behance",
  "linkedin.com": "linkedin",
};

export function detectTagFromUrl(
  url: string,
): "github" | "figma" | "behance" | "linkedin" | null {
  try {
    const { hostname } = new URL(url);
    const bare = hostname.replace(/^www\./, "");
    return HOST_TAG_MAP[bare] ?? null;
  } catch {
    return null;
  }
}

export function stripToPath(url: string, tag: string): string {
  if (tag === "other" || !url.startsWith("http")) return url;
  try {
    const { pathname, search, hash } = new URL(url);
    const path = pathname.replace(/^\//, "");
    return path + search + hash;
  } catch {
    return url;
  }
}

export function buildLinkUrl(tag: string, value: string): string {
  if (tag === "other" || value.startsWith("http")) return value;
  const prefixMap: Record<string, string> = {
    github: "https://github.com/",
    figma: "https://figma.com/",
    behance: "https://behance.net/",
    linkedin: "https://www.linkedin.com/",
  };
  return (prefixMap[tag] ?? "") + value;
}

export function extractLinkValue(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const isMatch = MATCHABLE_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname === `www.${host}`,
    );
    if (!isMatch) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

interface LinkRowProps {
  linkIndex: number;
  /** Field id from useFieldArray — the Reorder.Item identity. */
  value: string;
  control: Control<ProjectFormValues>;
  remove: (i: number) => void;
  error: string | undefined;
}

export default function LinkRow(props: LinkRowProps) {
  const { linkIndex, value, control, remove, error } = props;
  const dragControls = useDragControls();

  return (
    <Controller
      control={control}
      name={`link.${linkIndex}`}
      render={({ field }) => {
        const tag = field.value?.tag ?? "other";
        const match = LINK_TAGS.find((linkType) => linkType.value === tag);

        return (
          <Reorder.Item
            as="div"
            value={value}
            dragListener={false}
            dragControls={dragControls}
            className="relative"
          >
            <div
              title={error}
              className={cn(
                "focus-within:bg-card hover:bg-card relative flex grow basis-3/5 items-center rounded-xl px-2 py-2",
                {
                  "border-destructive border": error,
                },
              )}
            >
              <button
                type="button"
                aria-label="Drag to reorder"
                title="Drag to reorder"
                className="text-muted-foreground/40 hover:text-muted-foreground -ms-1 shrink-0 cursor-grab touch-none self-stretch px-1"
                onPointerDown={(event) => dragControls.start(event)}
              >
                <GripVertical size={16} />
              </button>

              <Select
                value={field.value?.tag ?? "other"}
                onValueChange={(val) =>
                  field.onChange({ ...field.value, tag: val })
                }
              >
                <SelectTrigger className="w-20 grow-0! border-none shadow-none">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {LINK_TAGS.map((linkType) => (
                    <SelectItem key={linkType.value} value={linkType.value}>
                      <span className="inline-flex items-center gap-2">
                        {linkType.icon}
                        <span className="sr-only">{linkType.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {match ? (
                <span className="text-foreground shrink-0 px-2 text-sm whitespace-nowrap">
                  {match?.prefix}
                </span>
              ) : null}

              <Input
                aria-label={`Link ${linkIndex + 1} value`}
                value={field.value?.value ?? ""}
                placeholder={match?.placeholder}
                className="text-foreground bg-muted placeholder:text-muted-foreground w-full text-sm"
                onChange={(e) => {
                  return field.onChange({
                    ...field.value,
                    value: normalizeUrl(e.target.value),
                  });
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  const fullUrl = extractLinkValue(pasted);
                  if (fullUrl) {
                    e.preventDefault();
                    const detectedTag = detectTagFromUrl(fullUrl);
                    const nextTag = detectedTag ?? field.value?.tag ?? "other";
                    field.onChange({
                      tag: nextTag,
                      value: stripToPath(fullUrl, nextTag),
                    });
                  }
                }}
              />

              <IconButton
                type="button"
                variant="destructive"
                className="ms-2 shrink-0"
                onClick={() => remove(linkIndex)}
              >
                <MinusIcon />
              </IconButton>
            </div>
          </Reorder.Item>
        );
      }}
    />
  );
}
