import { api } from "~/convex/_generated/api";
import { fetchAuthQuery, isAuthenticated } from "~/lib/auth-server";

export default async function DebugPage() {
  const auth_status = await isAuthenticated()
    .then((result) => ({ kind: "yes", result }))
    .catch(() => ({ kind: "none" }));
  const profile = await fetchAuthQuery(api.profiles.getForCurrentUser).catch(
    () => ({ kind: "none" }),
  );

  return (
    <div className="flex flex-col gap-4">
      <section>
        {auth_status.kind === "yes" ? "Authenticated" : "Not Authenticated"}
      </section>

      <p>{JSON.stringify(auth_status ?? { kind: "none" })}</p>
      <p>{JSON.stringify(profile ?? { kind: "none" })}</p>
    </div>
  );
}
