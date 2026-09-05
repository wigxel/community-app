"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import posthog from "posthog-js";
import { type ReactNode, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { env } from "~/env";
import { authClient } from "~/lib/auth-client";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);
const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

function PostHogIdentity() {
  const { data: session } = authClient.useSession();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isPostHogConfigured || !session?.user.id) return;
    if (identifiedUserId.current === session.user.id) return;

    if (identifiedUserId.current) posthog.reset();

    posthog.identify(session.user.id, {
      email: session.user.email,
      name: session.user.name,
    });
    identifiedUserId.current = session.user.id;
  }, [session?.user.email, session?.user.id, session?.user.name]);

  return null;
}

type ProvidersProps = {
  children: ReactNode;
  initialToken?: string | null;
};

function Providers(props: ProvidersProps) {
  const { children, initialToken } = props;

  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      <PostHogIdentity />
      {children}
      <Toaster position="bottom-right" richColors />
    </ConvexBetterAuthProvider>
  );
}

export default Providers;
