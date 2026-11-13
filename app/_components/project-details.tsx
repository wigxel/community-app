"use client";
import { ArrowUpRight } from "@hyperbridge/ui/icons";
import Link from "next/link";
import { RequireAuth } from "~/components/auth/require-auth";
import { Container } from "~/components/layouts/container";
import { ProfileAvatar } from "~/components/profile/avatar";
import { ProjectImpl } from "~/lib/factories/project";
import type { BasicProject } from "~/types/models";
import { FavouriteButton } from "./FavouriteButton";
import { MediaThumb } from "./MediaThumb";
import { SaveButton } from "./save-button";

type ProjectDetailsProps = { project: BasicProject };

export function ProjectDetails(props: ProjectDetailsProps) {
  const { project } = props;

  const links = ProjectImpl.links(project);
  const media = ProjectImpl.listMedia(project);
  const tags = project.tags ?? [];

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
          <RequireAuth>
            <FavouriteButton projectId={project._id} variant="overlay" />
          </RequireAuth>
          <RequireAuth>
            <SaveButton projectId={project._id} variant="overlay" />
          </RequireAuth>
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
        <div className="flex flex-col gap-8 md:flex-row">
          <article className="flex-1">
            {project.description && (
              <div className="order-1 w-full text-base md:text-xl">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}
          </article>

          <aside className="basis-4/12">
            {(links.length > 0 || tags.length > 0) && (
              <div className="sticky top-(--header-height) flex flex-col gap-6">
                {links.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-muted-foreground text-sm tracking-widest uppercase">
                      Project links
                    </h4>

                    <div className="flex flex-col gap-4">
                      {links.map((link) => {
                        return (
                          <Link
                            key={`${link.tag}-${link.value}`}
                            href={link.value}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="text-muted-foreground hover:text-foreground flex items-center gap-2 md:gap-4">
                              <link.Icon
                                size={"1em"}
                                className="text-foreground"
                              />
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
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <h4 className="text-muted-foreground text-sm tracking-widest uppercase">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?q=${encodeURIComponent(`#${tag}`)}`}
                          className="text-muted-foreground hover:text-brand-primary text-sm transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </Container>
    </Container>
  );
}
