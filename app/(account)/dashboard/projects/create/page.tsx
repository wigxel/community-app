import type { Metadata } from "next";
import { ProjectForm } from "~/components/forms/project";
import {
  DBHeader,
  DBHeaderDescription,
  DBHeaderTitle,
} from "~/components/layouts/dashboard-page-header";

export const metadata: Metadata = {
  title: "Create Project",
};

export default function CreateProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <DBHeader>
        <DBHeaderTitle text="Create project" />
        <DBHeaderDescription>
          Add a new project to your portfolio
        </DBHeaderDescription>
      </DBHeader>

      <ProjectForm mode="create" />
    </div>
  );
}
