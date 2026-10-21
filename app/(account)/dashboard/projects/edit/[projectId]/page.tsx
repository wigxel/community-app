import type { Metadata } from "next";
import { ProjectForm } from "~/components/forms/project";
import {
  DBHeader,
  DBHeaderDescription,
  DBHeaderTitle,
} from "~/components/layouts/dashboard-page-header";

export const metadata: Metadata = {
  title: "Edit Project",
};

export type EditProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function EditProjectPage(props: EditProjectPageProps) {
  const { params } = props;
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
