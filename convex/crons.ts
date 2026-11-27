import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Recompute leaderboard rankings daily at midnight UTC
crons.cron(
  "recompute leaderboard rankings",
  "0 0 * * *",
  internal.leaderboard.recomputeRankings,
  {},
);

// Recompute the featured-projects snapshot daily at 00:30 UTC — staggered
// after the leaderboard recompute so the two heavy scans never overlap.
crons.cron(
  "recompute featured projects",
  "30 0 * * *",
  internal.featured.recomputeFeatured,
  {},
);

// Seed defaults (skills + titles) hourly — skips if already run
crons.cron("seed defaults", "0 * * * *", internal.seeds.seedSome, {
  dryRun: false,
});

export default crons;
