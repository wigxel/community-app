export function ProjectCardSkeleton() {
  return (
    <section className="group bg-muted relative flex w-full flex-col rounded-(--project-card-media-radius) p-(--project-card-media-padding) text-[10px]">
      <div className="aspect-post bg-background w-full rounded-[calc(var(--project-card-media-radius)-calc(var(--project-card-media-padding)*0.5))]"></div>

      <div className="mt-2 flex items-center gap-2 px-4 pb-1.5">
        <div className="flex flex-1 items-center gap-2">
          <div className="size-[2.4em] animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-12 animate-pulse rounded-md bg-white/10" />
        </div>
        <div className="h-4 w-2/12 animate-pulse rounded-md bg-white/10" />
      </div>
    </section>
  );
}
