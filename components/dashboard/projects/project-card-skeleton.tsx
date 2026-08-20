export function ProjectCardSkeleton() {
  return (
    <section className="group flex flex-col relative text-[10px] rounded-(--project-card-media-radius) bg-muted p-(--project-card-media-padding) w-full">
      <div className="rounded-[calc(var(--project-card-media-radius)-calc(var(--project-card-media-padding)*0.5))] w-full aspect-post bg-background"></div>

      <div className="flex gap-2 pb-1.5 items-center mt-2 px-4">
        <div className="flex flex-1 gap-2 items-center">
          <div className="size-[2.4em] rounded-full bg-white/10 animate-pulse" />
          <div className="h-4 w-12 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="h-4 w-2/12 rounded-md bg-white/10 animate-pulse" />
      </div>
    </section>
  );
}
