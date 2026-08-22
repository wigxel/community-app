"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { Briefcase, Folder, Sparkles } from "lucide-react";
import Link from "next/link";
import { GettingStartedWidget } from "~/components/dashboard/getting-started-widget";
import StatCard from "~/components/dashboard/home/StatCard";
import WorkItem from "~/components/dashboard/home/WorkItem";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { api } from "~/convex/_generated/api";
import { ProjectImpl } from "~/lib/factories/project";
import type { Project } from "~/types/models";

const DashboardPage = () => {
  const profile = useQuery(api.profiles.getProfile);
  const workExperience = useQuery(
    api.workExperience.getByUserId,
    profile?.userId ? { userId: profile.userId } : "skip",
  );

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initial = profile.firstName.charAt(0).toUpperCase();
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
      <GettingStartedWidget />

      <Card className="bg-blue-500/20 text-blue-300 border border-white/10">
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile.profileImage || undefined} />
            <AvatarFallback className="bg-blue-500/20 text-blue-300">
              {initial}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="text-lg font-semibold text-white">{fullName}</p>
            <p className="text-sm text-white/60">{titleName}</p>

            <div className="mt-2">
              <Progress
                value={completionPercentage}
                className="h-2 bg-blue-500/30 text-blue-300"
              />
              <p className="text-xs text-white/50 mt-1">
                Profile {completionPercentage}% complete
              </p>
            </div>
          </div>

          <Link href={`/profile/${profile.username}`}>
            <Button
              size="sm"
              className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer"
            >
              View profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Briefcase className="h-5 w-5 text-blue-300" />}
          label="Work Experience"
          value={(workExperience?.length || 0).toString()}
        />
        <StatCard
          icon={<Folder className="h-5 w-5 text-blue-300" />}
          label="Projects"
          value={projectCount.toString()}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5 text-blue-300" />}
          label="Interests"
          value={(profile.interests?.length || 0).toString()}
        />
        <StatCard
          label="Phone Numbers"
          value={profile.phoneNumbers.length.toString()}
        />
      </div>

      <div>
        <Card className="bg-blue-500/20 text-blue-300 border border-white/10">
          <CardHeader>
            <CardTitle className="text-base text-white">
              Work Experience & Interests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.shortBio && (
              <div>
                <p className="text-sm text-white/60 mb-1">Bio</p>
                <p className="text-white">{profile.shortBio}</p>
              </div>
            )}

            {workExperience && workExperience.length > 0 ? (
              <div>
                <p className="text-sm text-white/60 mb-2">
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
              <p className="text-white/60 text-sm">
                No work experience added yet.
              </p>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div>
                <p className="text-sm text-white/60 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm border border-blue-400/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <TopProjects />

            <Link href={"/dashboard/settings/profile"}>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-300 hover:bg-blue-500/20 cursor-pointer"
              >
                Edit profile →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

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
          <p className="text-sm text-white/60 mb-2">Recent Projects</p>
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
