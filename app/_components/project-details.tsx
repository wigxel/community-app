"use client";
import { ArrowUpRight } from "@hyperbridge/ui/icons";
import { Calendar } from "iconsax-reactjs";
import Link from "next/link";
import { Container } from "~/components/layouts/container";
import { ProfileAvatar } from "~/components/profile/avatar";
import { ProjectImpl } from "~/lib/factories/project";
import type { Project } from "~/types/models";
import { FavouriteButton } from "./FavouriteButton";
import { MediaThumb } from "./MediaThumb";
import { SaveButton } from "./save-button";

type ProjectDetailsProps = { project: Project };

export function ProjectDetails(props: ProjectDetailsProps) {
  const { project } = props;

  const timelineLabel = ProjectImpl.timeline(project);
  const links = ProjectImpl.links(project);
  const media = ProjectImpl.listMedia(project);

  return (
    <Container className="-mx-4! flex w-auto flex-col px-0! py-12 md:mx-auto md:w-full lg:py-24">
      <Container level="inner" className="flex justify-baseline">
        <h1 className="text-3xl font-semibold">{project.title}</h1>
      </Container>

      <Container level="inner" className="mt-8 flex justify-between">
        <div className="flex items-center gap-2">
          <ProfileAvatar name={"Johnson Walker"} className="size-12" />

          <div className="gap flex flex-col">
            <Link
              href={`/profile/${project.username}`}
              className="hover:underline"
            >
              <span className="leading-none font-medium">
                {project.ownerName ?? "{{OwnerName}}"}
              </span>
            </Link>
            <span className="text-muted-foreground text-sm leading-none">
              {project.username}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FavouriteButton projectId={project._id} variant="overlay" />
          <SaveButton projectId={project._id} variant="overlay" />
        </div>
      </Container>

      <Container
        level="max"
        className="mt-12 flex flex-col gap-2 overflow-x-auto px-6 pt-4"
      >
        {media.map((item, i) => (
          <div
            key={item.metadata.storageId}
            className="corner-shape relative aspect-video overflow-hidden rounded-xl md:rounded-3xl"
          >
            <MediaThumb
              item={item}
              alt={`${project.title} media ${i + 1}`}
              className="object-cover"
            />
          </div>
        ))}
      </Container>

      <Container
        level="inner"
        className="md:flex-rows mt-12 flex flex-col items-start gap-8 md:justify-between"
      >
        <div className="order-0 md:order-2">
          {timelineLabel && (
            <div className="mb-1.5 flex items-center gap-1.5 tracking-widest uppercase">
              <Calendar size={"1em"} />
              {timelineLabel}
            </div>
          )}
        </div>

        {project.description && (
          <div className="order-1 max-w-[60ch]">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>
        )}
      </Container>

      {links.length > 0 ? (
        <Container
          level="inner"
          className="mt-12 flex flex-col gap-4 md:flex-row md:text-3xl"
        >
          <h4 className="basis-1/3 text-xl md:text-[1em]">External links</h4>

          <div className="flex basis-1/2 gap-8 md:basis-2/3 md:flex-col md:gap-8">
            {links.map((link) => {
              return (
                <Link
                  key={`${link.tag}-${link.value}`}
                  href={link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-muted-foreground hover:text-foreground flex items-center gap-2 md:gap-4">
                    <link.Icon size={"1em"} className="text-foreground" />
                    <span className="inline-flex items-center gap-1">
                      <span className="text-foreground inline-block">
                        {link.label}
                      </span>
                      <ArrowUpRight strokeWidth={0.5} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      ) : null}
    </Container>
  );
}
