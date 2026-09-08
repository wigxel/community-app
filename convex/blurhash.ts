"use node";

import { v } from "convex/values";
import { Either } from "effect";
import { api, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

export const generateForProject = internalAction({
  args: { projectId: v.id("project") },
  handler: async (ctx, { projectId }) => {
    const safeProject = await ctx.runQuery(api.project.getProject, {
      id: projectId,
    });

    if (Either.isLeft(safeProject)) return;

    const project = safeProject.right;

    let changed = false;

    for (let i = 0; i < project.media.length; i++) {
      const item = project.media[i];
      if (!item || item.type !== "photo") continue;
      const metadata = item.metadata as typeof item.metadata & {
        blurDataURL?: string;
      };
      if (metadata.blurDataURL) continue;
      if (!metadata.storageId) continue;

      try {
        const response = await ctx.storage.get(metadata.storageId);

        if (!response) continue;

        const buffer = Buffer.from(await response.arrayBuffer());

        const { default: sharp } = await import("sharp");

        const blurDataURL = await sharp(buffer)
          .resize(16, 16, { fit: "cover" })
          .jpeg({ quality: 20 })
          .toBuffer()
          .then((buf) => `data:image/jpeg;base64,${buf.toString("base64")}`);

        metadata.blurDataURL = blurDataURL;
        changed = true;
      } catch (err) {
        console.error(`BlurDataURL generation failed for media[${i}]:`, err);
      }
    }

    if (changed) {
      await ctx.runMutation(internal.project.updateProjectMedia, {
        projectId,
        media: project.media,
      });
    }
  },
});
