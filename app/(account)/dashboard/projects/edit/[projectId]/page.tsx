import { ProjectForm } from "~/components/forms/project";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">Edit Project</h1>
        <p className="mt-1 text-base text-white/50">
          Update your project details
        </p>
      </div>
      <ProjectForm mode="edit" projectId={projectId} />
    </div>
  );
}
