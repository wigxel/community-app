"use client";
import { IconButton } from "@hyperbridge/ui";
import { GlobeIcon, MinusIcon } from "lucide-react";
import { type Control, Controller, useFormContext } from "react-hook-form";
import { Behance, Figma, Github, LinkedIn } from "~/components/icons";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { ProjectFormValues } from "./project-form";

const LINK_TAGS = [
  {
    prefix: "github.com/",
    value: "github",
    label: "GitHub",
    icon: <Github size={"1em"} />,
    placeholder: "username",
  },
  {
    prefix: "linkedin.com/",
    value: "linkedin",
    label: "LinkedIn",
    icon: <LinkedIn size={"1em"} />,
    placeholder: "username",
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

interface LinkRowProps {
  linkIndex: number;
  control: Control<ProjectFormValues>;
  remove: (i: number) => void;
  error: string | undefined;
}

export default function LinkRow(props: LinkRowProps) {
  const { linkIndex, control, remove, error } = props;
  const { watch } = useFormContext();

  return (
    <Controller
      control={control}
      name={`link.${linkIndex}`}
      render={({ field }) => {
        const tag = watch(field.name)?.tag;
        const match = LINK_TAGS.find((linkType) => linkType.value === tag);

        return (
          <div>
            <div className="focus-within:bg-card hover:bg-card relative flex grow basis-3/5 items-center rounded-xl px-2 py-2">
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
                        {/*<span>{linkType.prefix}</span>*/}
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
                value={field.value?.value ?? ""}
                onChange={(e) =>
                  field.onChange({
                    ...field.value,
                    value: normalizeUrl(e.target.value),
                  })
                }
                placeholder={match?.placeholder}
                className="text-foreground bg-muted placeholder:text-muted-foreground w-full text-sm"
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
            {error && (
              <p className="ml-34 text-xs font-medium text-red-400">{error}</p>
            )}
          </div>
        );
      }}
    />
  );
}
