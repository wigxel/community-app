import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireRunMutationCtx } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL ?? "";

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await requireRunMutationCtx(ctx).scheduler.runAfter(
          0,
          internal.email.sendPasswordReset,
          {
            email: user.email,
            name: user.name,
            resetLink: url,
          },
        );
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await requireRunMutationCtx(ctx).scheduler.runAfter(
              0,
              internal.email.sendWelcome,
              {
                email: user.email,
                name: user.name,
              },
            );
          },
        },
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await requireRunMutationCtx(ctx).scheduler.runAfter(
            0,
            internal.email.sendMagicLink,
            {
              email,
              magicLink: url,
            },
          );
        },
      }),
      convex({ authConfig }),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
