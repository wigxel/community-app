"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, usePaginatedQuery } from "convex/react";
import { ArrowLeft, FolderOpen, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Form, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { ProjectCardSkeleton } from "~/components/dashboard/projects/project-card-skeleton";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { safeArray } from "~/lib/data.helpers";
import { toast } from "~/lib/toast";
import { projectSchema } from "~/lib/validators/schema";
import { pendingFiles } from "./media-row";
import { ProjectCard } from "./project-card";

const EMPTY_PROJECT = {
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
};

export const projectFormSchema = z.object({
  projects: z.array(projectSchema),
});

export type ProjectFormSchema = z.infer<typeof projectFormSchema>;

export function EditProjects() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(
    null,
  );
  const { results: projects, status } = usePaginatedQuery(
    api.project.listProject,
    {},
    { initialNumItems: 50 },
  );
  const isFetching = status === "LoadingFirstPage";
  const router = useRouter();

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getStorageUrl = useMutation(api.files.getStorageUrl);
  const createProject = useMutation(api.project.createProject);
  const updateProject = useMutation(api.project.updateProject);
  const deleteProject = useMutation(api.project.deleteProject);

  const form = useForm<ProjectFormSchema>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { projects: [] },
  });

  const { control, handleSubmit, reset } = form;
  const { isDirty } = form.formState;

  React.useEffect(() => {
    if (projects) reset({ projects: safeArray(projects) });
  }, [projects, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  const hasNoProjects = projects && fields.length === 0;

  function cleanProjects(projects: ProjectFormSchema["projects"]) {
    return projects.map((project) => ({
      ...project,
      media: project.media.filter((m) => m.metadata.url !== ""),
      link: project.link.filter((l) => l.value.trim() !== ""),
    }));
  }

  async function uploadPendingFiles(
    projects: ProjectFormSchema["projects"],
  ): Promise<ProjectFormSchema["projects"]> {
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

  async function onSubmit(data: ProjectFormSchema) {
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
    <Form {...form}>
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
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
              <ProjectCard key={field.id} index={index} onRemove={remove} />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append(EMPTY_PROJECT)}
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
    </Form>
  );
}
