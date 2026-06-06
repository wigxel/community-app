export function ProjectCardSkeleton() {
  return (
    <div className="rounded-3xl bg-blue-500/20 border border-white/10 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="h-7 w-48 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-9 w-40 rounded-full bg-white/10 animate-pulse" />
      </div>

      <div className="flex flex-col gap-2 mb-7">
        <div className="h-4 w-full rounded-md bg-white/10 animate-pulse" />
        <div className="h-4 w-5/6 rounded-md bg-white/10 animate-pulse" />
        <div className="h-4 w-3/4 rounded-md bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
