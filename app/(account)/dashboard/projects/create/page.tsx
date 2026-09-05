import { ProjectForm } from "~/components/forms/project";

export default function CreateProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">Create Project</h1>
        <p className="mt-1 text-base text-white/50">
          Add a new project to your portfolio
        </p>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
