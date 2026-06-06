export function EmptyStateContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <p className="text-white/60">{children}</p>
    </div>
  );
}
