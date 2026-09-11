import z from "zod";
import type { Id } from "~/convex/_generated/dataModel";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const BLOCKED_MIMES = new Set([
  "application/pdf",
  "image/gif",
  "image/svg+xml",
]);

export const timelineDate = z.union([
  z.null(),
  z.object({ year: z.string() }).strict(),
  z.object({ month: z.string(), year: z.string() }),
]);

export const mediaSchema = z.object({
  type: z.enum(["photo", "pdf", "video"]),
  metadata: z.object({
    url: z.string(),
    title: z
      .string()
      .max(100, { message: "Title cannot exceed 100 characters." })
      .optional(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    duration: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    storageId: z.string().optional(),
  }),
});

export const projectLinkSchema = z.object({
  tag: z.enum(["github", "live", "figma", "behance", "docs", "other"]),
  value: z.url({ message: "Please enter a  a valid URL." }),
});

export const projectSchema = z
  .object({
    _id: z.custom<Id<"project">>().optional(),
    userId: z.string(),
    title: z
      .string()
      .trim()
      .min(1, { message: "Title is required." })
      .max(100, { message: "Title cannot exceed 100 characters." }),
    description: z
      .string()
      .max(300, { message: "Description cannot exceed 300 characters." }),
    timeline: z.object({
      start: timelineDate,
      end: timelineDate,
    }),
    ongoing: z.boolean(),
    media: z
      .array(mediaSchema)
      .max(10, { message: "Maximum 10 media per project." }),
    link: z.array(projectLinkSchema),
  })
  .superRefine((val, ctx) => {
    // media: block new pdf/gif/svg (allow read of old pdf but reject on validate)
    for (let i = 0; i < val.media.length; i++) {
      const m = val.media[i];
      const mime = m.metadata.mimeType;
      if (m.type === "pdf" || BLOCKED_MIMES.has(mime)) {
        ctx.addIssue({
          code: "custom",
          path: ["media", i, "type"],
          message: "Only images (JPEG, PNG, WebP) and videos are allowed.",
        });
      }
    }
    const thisYear = new Date().getFullYear();
    const minYear = thisYear - 19;
    const checkYear = (
      d: z.infer<typeof timelineDate>,
      path: (string | number)[],
    ) => {
      if (!d) return;
      const y = Number(d.year);
      if (Number.isNaN(y) || y < minYear || y > thisYear) {
        ctx.addIssue({
          code: "custom",
          path,
          message: `Year must be between ${minYear} and ${thisYear}.`,
        });
      }
      if (
        "month" in d &&
        d.month &&
        !MONTHS.includes(d.month as (typeof MONTHS)[number])
      ) {
        ctx.addIssue({
          code: "custom",
          path,
          message: "Invalid month.",
        });
      }
    };
    checkYear(val.timeline.start, ["timeline", "start"]);
    checkYear(val.timeline.end, ["timeline", "end"]);
    if (val.ongoing && val.timeline.end !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["timeline", "end"],
        message: "End date must be empty when project is ongoing.",
      });
    }
    if (!val.timeline.start) {
      ctx.addIssue({
        code: "custom",
        path: ["timeline", "start"],
        message: "Start date is required.",
      });
    }
    if (!val.ongoing && !val.timeline.end) {
      ctx.addIssue({
        code: "custom",
        path: ["timeline", "end"],
        message: "End date is required when project is not ongoing.",
      });
    }
    if (val.timeline.start && val.timeline.end) {
      const toDate = (d: z.infer<typeof timelineDate>) => {
        if (!d) return null;
        const monthIdx =
          "month" in d && d.month
            ? MONTHS.indexOf(d.month as (typeof MONTHS)[number])
            : 0;
        return new Date(Number(d.year), monthIdx);
      };
      const s = toDate(val.timeline.start);
      const e = toDate(val.timeline.end);
      if (s && e && e < s) {
        ctx.addIssue({
          code: "custom",
          path: ["timeline", "end"],
          message: "End date cannot be before start date.",
        });
      }
    }
  });
