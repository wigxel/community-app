"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, FolderOpen, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { pendingFiles } from "~/components/dashboard/projects/edit/media-row";
import { ProjectCard } from "~/components/dashboard/projects/edit/project-card";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { safeArray } from "~/lib/data.helpers";
import type { Project } from "~/types/models";

const emptyProject = (): Project => ({
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
});

export const timelineDate = z.union([
  z.null(),
  z.object({ year: z.string() }),
  z.object({ month: z.string(), year: z.string() }),
]);

export const formSchema = z.object({
  projects: z.array(
    z.object({
      _id: z.custom<Id<"project">>().optional(),
      userId: z.string(),
      title: z
        .string()
        .min(1, { message: "Title is required." })
        .max(100, { message: "Title cannot exceed 100 characters." }),
      description: z
        .string()
        .max(300, { message: "Description cannot exceed 300 characters." }),
      timeline: z.object({
        start: timelineDate,
        end: timelineDate,
      }),
      ongoing: z.boolean(),
      media: z.array(
        z.object({
          type: z.enum(["photo", "pdf", "video"]),
          metadata: z.object({
            url: z.string(),
            title: z
              .string()
              .max(100, { message: "Title cannot exceed 100 characters." })
              .optional(),
            filename: z.string(),
            mimeType: z.string(),
            size: z.number(),
            duration: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            storageId: z.string().optional(),
          }),
        }),
      ),
      link: z.array(
        z.object({
          tag: z.enum(["github", "live", "figma", "behance", "docs", "other"]),
          value: z.url({ message: "Please enter a  a valid URL." }),
        }),
      ),
    }),
  ),
});

export default function EditProjects() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(
    null,
  );
  const projects = useQuery(api.project.listProject);
  const isFetching = projects === undefined;
  const router = useRouter();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getStorageUrl = useMutation(api.files.getStorageUrl);
  const createProject = useMutation(api.project.createProject);
  const updateProject = useMutation(api.project.updateProject);
  const deleteProject = useMutation(api.project.deleteProject);

  const { control, handleSubmit, reset, ...form } = useForm<
    z.infer<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
    defaultValues: { projects: [] },
  });

  const { isDirty } = form.formState;

  React.useEffect(() => {
    if (projects) reset({ projects: safeArray(projects) });
  }, [projects, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  const hasNoProjects = projects && fields.length === 0;

  function cleanProjects(projects: z.infer<typeof formSchema>["projects"]) {
    return projects.map((project) => ({
      ...project,
      media: project.media.filter((m) => m.metadata.url !== ""),
      link: project.link.filter((l) => l.value.trim() !== ""),
    }));
  }

  async function uploadPendingFiles(
    projects: z.infer<typeof formSchema>["projects"],
  ): Promise<z.infer<typeof formSchema>["projects"]> {
    const result = structuredClone(projects);
    const pending = Array.from(pendingFiles.entries());

    for (let i = 0; i < pending.length; i++) {
      const pendingItem = pending[i];
      if (!pendingItem) continue;
      const [key, file] = pendingItem;
      const [projectIndexStr, mediaIndexStr] = key.split("-");
      const pIdx = Number(projectIndexStr);
      const mIdx = Number(mediaIndexStr);

      setUploadProgress(
        `Uploading file ${i + 1} of ${pending.length}: ${file.name}`,
      );

      const uploadUrl = await generateUploadUrl();

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!res.ok) throw new Error(`Upload failed for ${file.name}`);

      const { storageId } = (await res.json()) as { storageId: string };
      const url = await getStorageUrl({ storageId });

      if (result[pIdx]?.media[mIdx]) {
        result[pIdx].media[mIdx].metadata.url = url ?? "";
        result[pIdx].media[mIdx].metadata.storageId = storageId;
      }
    }

    return result;
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSaving(true);
    setUploadProgress(null);

    try {
      const projectsWithUrls = await uploadPendingFiles(data.projects);
      pendingFiles.clear();
      const filteredProjects = cleanProjects(projectsWithUrls);

      const submittedIds = new Set(
        filteredProjects.map((p) => p._id).filter(Boolean) as Id<"project">[],
      );
      const removedIds = safeArray(projects)
        .map((p) => p._id)
        .filter((id) => !submittedIds.has(id));

      for (const _id of removedIds) await deleteProject({ _id });

      for (const project of filteredProjects) {
        if (project._id) await updateProject({ project });
        else await createProject({ project });
      }

      router.push("/dashboard/projects");
    } catch (err) {
      console.error("Save failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while saving. Please try again.";
      toast.error(message);
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Edit Projects</h1>
          <p className="mt-1 text-base text-white/50">
            Add and manage your projects
          </p>
        </div>

        {projects && projects.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            className="gap-2 rounded-xl"
            disabled={isSaving}
            onClick={() => router.push("/dashboard/projects")}
          >
            <ArrowLeft /> Return
          </Button>
        )}
      </div>

      {isFetching ? (
        <ProjectCardSkeleton />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {hasNoProjects && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/5 py-16 text-center">
              <FolderOpen size={32} className="text-white/20" />
              <div>
                <p className="text-sm font-medium text-white/50">
                  No projects yet
                </p>
                <p className="text-xs text-white/30">
                  Add your first project below
                </p>
              </div>
            </div>
          )}

          {fields.map((field, index) => (
            <ProjectCard
              key={field.id}
              index={index}
              control={control}
              remove={remove}
              {...form}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            className="mt-2 h-16 w-full gap-2 rounded-2xl border-dashed border-white/20 bg-transparent text-white/50 hover:border-white/40 hover:bg-white/5 hover:text-white"
            onClick={() => append(emptyProject())}
          >
            <Plus size={16} />
            Add project
          </Button>

          {uploadProgress && (
            <p className="text-center text-xs text-white/50">
              {uploadProgress}
            </p>
          )}

          <Button
            type="submit"
            variant="secondary"
            disabled={isSaving || !isDirty}
            className="gap-2 rounded-xl"
          >
            <Save size={15} />
            {isSaving
              ? uploadProgress
                ? "Uploading…"
                : "Saving…"
              : "Save changes"}
          </Button>
        </form>
      )}
    </div>
  );
}
