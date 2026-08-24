"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { env } from "~/env";
import { authClient } from "~/lib/auth-client";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);
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
      {children}
      <Toaster position="bottom-right" richColors />
    </ConvexBetterAuthProvider>
  );
}

export default Providers;
