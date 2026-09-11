import { ProjectForm } from "~/components/forms/project";
import {
  DBHeader,
  DBHeaderDescription,
  DBHeaderTitle,
} from "~/components/layouts/dashboard-page-header";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div>
      <DBHeader>
        <DBHeaderTitle text={"Edit Project"} />
        <DBHeaderDescription>Update your project details</DBHeaderDescription>
      </DBHeader>

      <ProjectForm mode="edit" projectId={projectId} />
    </div>
  );
}
