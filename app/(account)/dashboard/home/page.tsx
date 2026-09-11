"use client";

import { Button } from "@hyperbridge/ui";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Mobile } from "iconsax-reactjs";
import { Briefcase, Folder, Sparkles } from "lucide-react";
import Link from "next/link";
import StatCard from "~/components/dashboard/home/StatCard";
import WorkItem from "~/components/dashboard/home/WorkItem";
import { FullscreenLoader } from "~/components/layouts/loader";
import { AuthUserAvatar } from "~/components/profile/auth-user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { SegmentProgressBar } from "~/components/ui/segmented-gradient-progress";
import { api } from "~/convex/_generated/api";
import { ProjectImpl } from "~/lib/factories/project";
import type { Project } from "~/types/models";

function DashboardPage() {
  const profile = useQuery(api.profiles.getProfile);
  const workExperience = useQuery(
    api.workExperience.getByUserId,
    profile?.userId ? { userId: profile.userId } : "skip",
  );

  if (!profile) {
    return <FullscreenLoader />;
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const titleName = profile.title?.name || "No title set";

  // Calculate profile completion
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.email,
    profile.username,
    profile.title,
    profile.shortBio,
    profile.profileImage,
    profile.phoneNumbers.length > 0,
    profile?.projects && profile.projects.length > 0,
  ];

  const completedFields = fields.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedFields / fields.length) * 100,
  );

  const projectCount = profile?.projects?.length || 0;

  return (
    <div className="space-y-6">
      <Card className="text-brand-primary border border-white/10">
        <CardContent className="flex items-center gap-4 pt-6">
          <AuthUserAvatar className="size-14" />

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-end gap-2 leading-none">
              <p className="text-foreground text-lg leading-none font-semibold">
                {fullName}
              </p>
              <p className="text-muted-foreground text-sm leading-none">
                {titleName}
              </p>
            </div>

            <div>
              <SegmentProgressBar
                progressValue={completionPercentage}
                className="text-brand-primary h-4"
              />
              <p className="text-foreground/50 mt-1 text-xs">
                Profile {completionPercentage}% complete
              </p>
            </div>
          </div>

          <Link href={`/profile/${profile.username}`}>
            <Button size="sm">View profile</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Briefcase className="text-brand-primary h-5 w-5" />}
          label="Work Experience"
          value={(workExperience?.length || 0).toString()}
        />
        <StatCard
          icon={<Folder className="text-brand-primary h-5 w-5" />}
          label="Projects"
          value={projectCount.toString()}
        />
        <StatCard
          icon={<Sparkles className="text-brand-primary h-5 w-5" />}
          label="Interests"
          value={(profile.interests?.length || 0).toString()}
        />
        <StatCard
          icon={<Mobile className="text-brand-primary h-5 w-5" />}
          label="Phone Numbers"
          value={profile.phoneNumbers.length.toString()}
        />
      </div>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Work Experience & Interests</CardTitle>
            <Link href={"/dashboard/settings/profile"}>
              <Button size="sm" variant="default">
                Edit profile
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            {profile.shortBio && (
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Bio</p>
                <p className="text-foreground">{profile.shortBio}</p>
              </div>
            )}

            {workExperience && workExperience.length > 0 ? (
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  Recent Work Experience
                </p>
                {workExperience.slice(0, 3).map((exp) => {
                  const startYear = new Date(exp.timeline.start).getFullYear();
                  const endYear = exp.timeline.end
                    ? new Date(exp.timeline.end).getFullYear()
                    : "Present";
                  return (
                    <WorkItem
                      key={exp._id}
                      position={exp.position}
                      company={exp.companyName}
                      timeline={`${startYear} — ${endYear}`}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No work experience added yet.
              </p>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2 text-sm">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-brand-primary rounded-full border border-blue-400/30 px-3 py-1 text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <TopProjects />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TopProjects() {
  const { results } = usePaginatedQuery(
    api.project.listProject,
    {},
    { initialNumItems: 2 },
  );

  return (
    <>
      {results.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-sm">Recent Projects</p>
          {results.map((project) => (
            <WorkItem
              key={project.title}
              position={project.title}
              company={`${project.description.slice(0, 50)}...`}
              timeline={ProjectImpl.timeline(project as Project) ?? ""}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default DashboardPage;
