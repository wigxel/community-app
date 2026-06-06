"use client";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";
import React, { Fragment } from "react";
import {
  type Control,
  Controller,
  type FormState,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  useFieldArray,
} from "react-hook-form";
import type { z } from "zod";

import type { formSchema } from "~/app/dashboard/projects/edit/page";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import type { Media, ProjectLink } from "~/types/models";
import LinkRow from "./link-row";
import MediaRow from "./media-row";
import TimelineSelect from "./timeline-select";

const emptyMedia = (): Media => ({
  type: "photo",
  metadata: {
    url: "",
    filename: "",
    mimeType: "",
    size: 0,
    width: 0,
    height: 0,
  },
});

const emptyLink = (): ProjectLink => ({
  tag: "github",
  value: "",
});

interface ProjectCardProps {
  index: number;
  control: Control<z.infer<typeof formSchema>>;
  register: UseFormRegister<z.infer<typeof formSchema>>;
  remove: (i: number) => void;
  watch: UseFormWatch<z.infer<typeof formSchema>>;
  setValue: UseFormSetValue<z.infer<typeof formSchema>>;
  formState: FormState<z.infer<typeof formSchema>>;
}

export function ProjectCard({
  index,
  control,
  register,
  remove,
  watch,
  setValue,
  formState: { errors },
}: ProjectCardProps) {
  const [open, setOpen] = React.useState(true);

  const title = watch(`projects.${index}.title`);
  const ongoing = watch(`projects.${index}.ongoing`);

  React.useEffect(() => {
    if (ongoing) setValue(`projects.${index}.timeline.end`, null);
  }, [ongoing, index, setValue]);

  const {
    fields: mediaFields,
    append: appendMedia,
    remove: removeMedia,
  } = useFieldArray({ control, name: `projects.${index}.media` });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control, name: `projects.${index}.link` });

  return (
    <Card className="rounded-3xl border border-white/10 bg-blue-500/20 text-blue-300 shadow-none">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                  <FolderOpen size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-base text-white">
                    {title || `Project ${index + 1}`}
                  </CardTitle>
                  {!open && (
                    <CardDescription className="text-xs text-white/40">
                      Click to expand
                    </CardDescription>
                  )}
                </div>
                {open ? (
                  <ChevronUp size={16} className="shrink-0 text-white/40" />
                ) : (
                  <ChevronDown size={16} className="shrink-0 text-white/40" />
                )}
              </button>
            </CollapsibleTrigger>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-white/30 hover:bg-red-400/10 hover:text-red-400"
              onClick={() => remove(index)}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="flex flex-col gap-6 pt-0">
            <Separator className="bg-white/10" />

            {/* Title & Description */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={`projects.${index}.title`}
                  className="text-xs font-semibold uppercase tracking-widest text-white/50 after:content-['*'] after:ml-0.5"
                >
                  Title
                </Label>
                <Input
                  {...register(`projects.${index}.title`)}
                  id={`projects.${index}.title`}
                  placeholder="Project name"
                  maxLength={100}
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                />
                {errors.projects?.[index]?.title?.message && (
                  <p className="text-xs font-medium text-red-400">
                    {errors.projects[index].title.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={`projects.${index}.description`}
                  className="text-xs font-semibold uppercase tracking-widest text-white/50"
                >
                  Description
                </Label>
                <div className="relative">
                  <Textarea
                    {...register(`projects.${index}.description`)}
                    id={`projects.${index}.description`}
                    placeholder="What did you build or work on?"
                    rows={3}
                    maxLength={300}
                    className="resize-none border-white/15 bg-white/5 text-white placeholder:text-white/30"
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-white/30">
                    {watch(`projects.${index}.description`)?.length ?? 0}/300
                  </span>
                </div>
                {errors.projects?.[index]?.description?.message && (
                  <p className="text-xs font-medium text-red-400">
                    {errors.projects[index].description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
                <Calendar size={12} />
                Timeline
              </Label>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id={`projects.${index}.ongoing`}
                  {...register(`projects.${index}.ongoing`)}
                  className="accent-blue-400"
                />
                <Label
                  htmlFor={`projects.${index}.ongoing`}
                  className="text-xs text-white/50 font-medium"
                >
                  I am currently working on this project
                </Label>
              </div>

              <div className="flex items-center divide-x divide-white/15 *:w-full *:px-5 [&>*:first-child]:pl-0 [&>*:last-child]:pr-0">
                {(["start", "end"] as const)
                  .filter((key) => !(key === "end" && ongoing))
                  .map((key) => (
                    <Fragment key={key}>
                      <Controller
                        control={control}
                        name={`projects.${index}.timeline.${key}`}
                        render={({ field }) => (
                          <TimelineSelect
                            timeline={key}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Fragment>
                  ))}
              </div>
            </div>

            {/* Media */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50">
                  <ImageIcon size={12} />
                  Media
                  {mediaFields.length > 0 && (
                    <Badge
                      variant="outline"
                      className="ml-1 border-white/20 px-1.5 py-0 text-[10px] text-white/50"
                    >
                      {mediaFields.length}
                    </Badge>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-blue-300/70 hover:bg-blue-500/15 hover:text-blue-200"
                  onClick={() => appendMedia(emptyMedia())}
                >
                  <Plus size={12} />
                  Add media
                </Button>
              </div>

              {mediaFields.length > 0 && (
                <div className="flex flex-col gap-2">
                  {mediaFields.map((field, mIdx) => (
                    <MediaRow
                      key={field.id}
                      projectIndex={index}
                      mediaIndex={mIdx}
                      control={control}
                      register={register}
                      watch={watch}
                      remove={removeMedia}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/50">
                  <Link2 size={12} />
                  Links
                  {linkFields.length > 0 && (
                    <Badge
                      variant="outline"
                      className="ml-1 border-white/20 px-1.5 py-0 text-[10px] text-white/50"
                    >
                      {linkFields.length}
                    </Badge>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-blue-300/70 hover:bg-blue-500/15 hover:text-blue-200"
                  onClick={() => appendLink(emptyLink())}
                >
                  <Plus size={12} />
                  Add link
                </Button>
              </div>

              {linkFields.length > 0 && (
                <div className="flex flex-col gap-2">
                  {linkFields.map((field, lIdx) => (
                    <LinkRow
                      key={field.id}
                      projectIndex={index}
                      linkIndex={lIdx}
                      control={control}
                      remove={removeLink}
                      error={
                        errors.projects?.[index]?.link?.[lIdx]?.value?.message
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
