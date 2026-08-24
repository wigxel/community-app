export function FavouritedProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-video w-full animate-pulse rounded-xl bg-white/5" />
      <div className="flex items-center gap-2 px-1">
        <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}
