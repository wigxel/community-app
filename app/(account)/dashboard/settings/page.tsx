import { redirect } from "next/navigation";

export default function SettingsPage() {
  return redirect("/dashboard/settings/profile");
}
