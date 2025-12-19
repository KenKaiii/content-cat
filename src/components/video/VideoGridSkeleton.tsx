"use client";

interface VideoGridSkeletonProps {
  count: number;
}

export default function VideoGridSkeleton({ count }: VideoGridSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`video-skeleton-${index}`}
          className="animate-in fade-in w-full pt-1 pl-1 duration-500"
          style={{ marginBottom: "20px" }}
        >
          <div
            className="grid items-stretch"
            style={{
              gridTemplateColumns: "1fr minmax(200px, 260px)",
              gap: "12px",
            }}
          >
            {/* Video Preview Skeleton */}
            <div
              className="grid grid-flow-row-dense auto-rows-[1fr] gap-2"
              style={{ gridTemplateColumns: "1fr" }}
            >
              <div className="skeleton-loader relative overflow-hidden rounded-2xl bg-zinc-900">
                <div
                  className="relative h-full w-full"
                  style={{ aspectRatio: "1.77778 / 1" }}
                >
                  {/* Pulsing video icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="animate-pulse text-zinc-500"
                      >
                        <path
                          d="M4.78824 1.26719C3.78891 0.649958 2.5 1.36881 2.5 2.54339V9.45736C2.5 10.6319 3.7889 11.3508 4.78824 10.7336L10.3853 7.27657C11.3343 6.69042 11.3343 5.31034 10.3853 4.72418L4.78824 1.26719Z"
                          fill="currentColor"
                          transform="translate(4, 5)"
                        />
                      </svg>
                      <span className="animate-pulse text-xs text-zinc-500">
                        Generating video...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel Skeleton */}
            <div id="action-panel" className="min-w-0 will-change-auto">
              <div className="relative grid h-full content-start justify-items-start gap-3 rounded-2xl border border-zinc-800/50 bg-zinc-950 p-4 pb-14">
                {/* Model Badge Skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-7 w-28 animate-pulse rounded-lg bg-zinc-800" />
                </div>

                {/* Prompt Text Skeleton */}
                <div className="flex w-full flex-col gap-2">
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
                </div>

                {/* Thumbnail Placeholders Skeleton */}
                <div className="flex flex-wrap gap-2">
                  <div className="size-6 rotate-[5deg] animate-pulse rounded-lg bg-zinc-800 lg:size-10" />
                  <div className="size-6 -rotate-[5deg] animate-pulse rounded-lg bg-zinc-800 lg:size-10" />
                </div>

                {/* Settings Badges Skeleton */}
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-14 animate-pulse rounded-lg bg-zinc-800" />
                  <div className="h-6 w-10 animate-pulse rounded-lg bg-zinc-800" />
                </div>

                {/* Bottom Date Skeleton */}
                <span className="absolute bottom-4.5 left-4 h-4 w-24 animate-pulse rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
