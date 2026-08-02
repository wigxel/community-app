// components/profile/bluesky-link.tsx

interface BlueskyLinkProps {
  handle: string;
}

export function BlueskyLink({ handle }: BlueskyLinkProps) {
  return (
    <a
      href={`https://bsky.app/profile/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-3xl border border-white/20 bg-linear-to-br from-white/15 to-white/5 p-6 transition-all hover:border-white/30 hover:shadow-xl hover:scale-[1.02] md:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-linear-to-br from-sky-500/20 to-blue-500/20 p-3 transition-all group-hover:from-sky-500/30 group-hover:to-blue-500/30 group-hover:scale-110 shadow-lg">
          <svg
            viewBox="0 0 360 320"
            className="h-[22px] w-[22px] fill-sky-300"
            aria-hidden="true"
          >
            <path d="M180 142c-16.3-31.7-60.7-90.8-102-120C46.9 2.8 27.5-1 16 1 5.7 2.7 0 7.8 0 14.5c0 7.2 5.5 13 16 20.5 22.2 15.5 57.3 35.4 76 64.7-22-12.2-56.5-31.2-86-43.7-19.5-8.4-35.5-12-47-12-8.2 0-13 2-15 5.2-2.7 4.5 0 11 9 18.8 16 13.5 46 32.8 79 50.5-25.5-7.5-72-23-106-30.5C-5 83.7-1 101 17 113c17.8 11.7 73 28.2 123.8 30.5C99 156 60.5 172.8 44 183 26.3 194 14 205 14 215.5c0 8.5 7.7 12.5 19 12.5 19 0 53-9.5 82.5-25.7-12 15.5-26.5 39.2-28.5 54C84 272 93.5 280 105 280c14.5 0 30.5-11.5 43-32.5 12.5-21 20-46.5 32-46.5s19.5 25.5 32 46.5c12.5 21 28.5 32.5 43 32.5 11.5 0 21-8 18-24-2-14.8-16.5-38.5-28.5-54C267 218 301 227.5 320 227.5c11.3 0 19-4 19-12.5C339 205 327 194 309 183c-16.5-10.2-55-27-97-32.5C263 148.2 318 131.7 335.8 120c18-12 22-29.3-5.8-25C296 102.5 249.5 119 224 126.5c33-17.7 63-37 79-50.5 9-7.8 11.7-14.3 9-18.8-2-3.2-6.8-5.2-15-5.2-11.5 0-27.5 3.6-47 12-29.5 12.5-64 31.5-86 43.7C182.3 79.4 217.5 59.5 239.7 44 250.2 36.5 255.7 30.7 255.7 23.5c0-6.7-5.7-11.8-16-13.5C228.3-1 209-2.8 282 22c-41.3 29.2-85.7 88.3-102 120z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-xs tracking-wider text-white/60 uppercase font-semibold">
            Bluesky
          </div>
          <p className="truncate text-lg font-medium text-white/95 transition-colors group-hover:text-sky-300">
            @{handle}
          </p>
        </div>
      </div>
    </a>
  );
}
