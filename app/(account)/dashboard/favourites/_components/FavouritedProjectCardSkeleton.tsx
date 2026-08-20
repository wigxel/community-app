export function FavouritedProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-video w-full rounded-xl bg-white/5 animate-pulse" />
      <div className="flex items-center gap-2 px-1">
        <div className="h-5 w-5 shrink-0 rounded-full bg-white/10 animate-pulse" />
        <div className="h-3 w-32 rounded bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}
