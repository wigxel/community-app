"use node";

import { render } from "@react-email/render";
import { v } from "convex/values";
import { SendMailClient } from "zeptomail";
import { MagicLinkEmail } from "../emails/magic-link";
import { PasswordResetEmail } from "../emails/password-reset";
import { WelcomeEmail } from "../emails/welcome";
import { internalAction } from "./_generated/server";

type SendArgs = {
  to: { address: string; name?: string };
  subject: string;
  html: string;
};

function getClient() {
  const url = process.env.ZEPTOMAIL_URL;
  const token = process.env.ZEPTOMAIL_TOKEN;
  if (!url || !token) {
    throw new Error("ZEPTOMAIL_URL and ZEPTOMAIL_TOKEN must be set");
  }
  return new SendMailClient({ url, token });
}

async function sendMail({ to, subject, html }: SendArgs) {
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS;
  const fromName = process.env.ZEPTOMAIL_FROM_NAME ?? "Community App";
  if (!fromAddress) {
    throw new Error("ZEPTOMAIL_FROM_ADDRESS must be set");
  }

  const client = getClient();
  await client.sendMail({
    from: { address: fromAddress, name: fromName },
    to: [
      {
        email_address: { address: to.address, name: to.name ?? to.address },
      },
    ],
    subject,
    htmlbody: html,
  });
}

export const sendWelcome = internalAction({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    dashboardUrl: v.optional(v.string()),
  },
  handler: async (_ctx, { email, name, dashboardUrl }) => {
    const html = await render(
      WelcomeEmail({
        name,
        dashboardUrl,
      }),
    );
    await sendMail({
      to: { address: email, name },
      subject: "Welcome to Community App",
      html,
    });
  },
});

export const sendMagicLink = internalAction({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    magicLink: v.string(),
    expiresInMinutes: v.optional(v.number()),
  },
  handler: async (_ctx, { email, name, magicLink, expiresInMinutes }) => {
    const html = await render(
      MagicLinkEmail({
        name,
        magicLink,
        expiresInMinutes,
      }),
    );
    await sendMail({
      to: { address: email, name },
      subject: "Your sign-in link",
      html,
    });
  },
});

export const sendPasswordReset = internalAction({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    resetLink: v.string(),
    expiresInMinutes: v.optional(v.number()),
  },
  handler: async (_ctx, { email, name, resetLink, expiresInMinutes }) => {
    const html = await render(
      PasswordResetEmail({
        name,
        resetLink,
        expiresInMinutes,
      }),
    );
    await sendMail({
      to: { address: email, name },
      subject: "Reset your password",
      html,
    });
  },
});
