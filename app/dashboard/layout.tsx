import { redirect } from "next/navigation";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "~/convex/_generated/api";
import Sidebar from "./_components/Sidebar";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/auth?redirect=/dashboard");
  }

  try {
    const profile = await fetchAuthQuery(api.profiles.getForCurrentUser);
    if (!profile) {
      redirect("/onboarding?redirect=/dashboard");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    redirect("/onboarding?redirect=/dashboard");
  }

  return (
    <div className="min-h-screen text-white">
      <Sidebar />

      <main className="lg:ml-64 px-5 py-8 md:px-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
