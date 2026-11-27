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

// Recompute the featured projects snapshot daily, staggered after the
// leaderboard's midnight run
crons.cron(
  "recompute featured projects",
  "30 0 * * *",
  internal.featuredProjects.recomputeFeatured,
  {},
);

// Seed defaults (skills + titles) hourly — skips if already run
crons.cron("seed defaults", "0 * * * *", internal.seeds.seedSome, {
  dryRun: false,
});

export default crons;
