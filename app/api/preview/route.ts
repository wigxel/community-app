import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";
import { ProjectImpl } from "~/lib/factories/project";
import { Result } from "~/lib/result";

/**
 * Entry point for previewing an unpublished project. Verifies the viewer
 * owns it, enables Next.js Draft Mode so the public page renders their
 * draft per-request instead of the cached public view, then redirects to
 * the project's public URL.
 *
 * The cookie only changes caching and credential forwarding; the data gates
 * in the queries still hold for every viewer, so toggling it by hand leaks
 * nothing.
 */
export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return new Response("Not authenticated", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return new Response("projectId is required", { status: 400 });
  }

  const result = await fetchAuthQuery(api.project.getProject, {
    id: projectId,
  }).catch(() => null);
  const project = Result.match(result, {
    error: () => null,
    success: (data) => data,
  });

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(ProjectImpl.url(project));
}
