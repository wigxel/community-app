"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
import { Loader } from "~/components/layouts/loader";
import { Button } from "~/components/ui/button";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { Result } from "~/lib/result";
import { toast } from "~/lib/toast";
import { projectSchema as projectFormSchema } from "~/lib/validators/schema";
import { HoveringFormActions } from "../shared/hovering-form-action";
import { LinksSection } from "./links-section";
import { pendingFiles } from "./media-row";
import { MediaSection } from "./media-section";
import { ProjectFormItem } from "./project-form-item";

const DEFAULT_PROJECT = {
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
};

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  mode: "create" | "edit";
  projectId?: string;
}

export function ProjectForm({ mode, projectId }: ProjectFormProps) {
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(
    null,
  );
  const router = useRouter();

  const project = useQuery(
    api.project.getProject,
    mode === "edit" ? { id: projectId ?? null } : "skip",
  );

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getStorageUrl = useMutation(api.files.getStorageUrl);
  const createProject = useMutation(api.project.createProject);
  const updateProject = useMutation(api.project.updateProject);

  const isLoading = mode === "edit" && project === undefined;
  const isError =
    mode === "edit" &&
    project !== undefined &&
    Result.match(project, {
      loading: () => false,
      success: () => false,
      error: () => true,
    });

  const projectData =
    mode === "edit" && project !== undefined
      ? Result.match(project, {
          loading: () => null,
          success: (data) => data,
          error: () => null,
        })
      : null;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: DEFAULT_PROJECT,
  });

  const { handleSubmit, reset } = form;

  React.useEffect(() => {
    if (mode === "edit" && projectData) {
      reset(projectData);
    }
  }, [mode, projectData, reset]);

  async function uploadPendingFiles(
    projectData: ProjectFormValues,
  ): Promise<ProjectFormValues> {
    const result = structuredClone(projectData);
    const pending = Array.from(pendingFiles.entries());

    for (let i = 0; i < pending.length; i++) {
      const pendingItem = pending[i];
      if (!pendingItem) continue;
      const [key, file] = pendingItem;
      const mediaIndex = Number(key.split("-")[1]);

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

      if (result.media[mediaIndex]) {
        result.media[mediaIndex].metadata.url = url ?? "";
        result.media[mediaIndex].metadata.storageId = storageId;
      }
    }

    return result;
  }

  async function onSubmit(data: ProjectFormValues) {
    setUploadProgress(null);

    try {
      const projectWithUrls = await uploadPendingFiles(data);
      pendingFiles.clear();

      const cleanedProject = {
        ...projectWithUrls,
        media: projectWithUrls.media.filter((m) => m.metadata.url !== ""),
        link: projectWithUrls.link.filter((l) => l.value.trim() !== ""),
      };

      if (mode === "edit" && projectId) {
        await updateProject({
          project: { ...cleanedProject, _id: projectId as Id<"project"> },
        });
      } else {
        await createProject({ project: cleanedProject });
      }

      if (
        process.env.NEXT_PUBLIC_POSTHOG_KEY &&
        process.env.NEXT_PUBLIC_POSTHOG_HOST
      ) {
        posthog.capture("project_saved", {
          mode,
          has_media: cleanedProject.media.length > 0,
          has_links: cleanedProject.link.length > 0,
        });
      }

      toast.success(
        mode === "create"
          ? "Project created successfully"
          : "Project updated successfully",
      );
      router.push("/dashboard/projects");
    } catch (err) {
      console.error("Save failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while saving. Please try again.";
      toast.error(message);
    } finally {
      setUploadProgress(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-center">
        <p className="text-sm font-medium text-white/50">Project not found</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/dashboard/projects")}
        >
          Back to projects
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto mt-16 flex max-w-3xl flex-col gap-8">
          <ProjectFormItem />

          {/* Media Section */}
          <MediaSection />

          {/* Links Section */}
          <LinksSection />
        </div>

        {uploadProgress && (
          <p className="text-xs text-white/50">{uploadProgress}</p>
        )}

        <HoveringFormActions mode={mode} />
      </form>
    </FormProvider>
  );
}
