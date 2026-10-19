"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { toast } from "~/lib/toast";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3a7.19 7.19 0 0 1-10.73-3.79H1.35v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.34 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.35a12 12 0 0 0 0 10.78l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.6 4.6 1.79l3.45-3.45C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.35 6.61l3.99 3.09A7.19 7.19 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

export type GoogleSignInButtonProps = { redirectTo?: string };

export function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const callbackURL = redirectTo || "/dashboard";
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
      newUserCallbackURL: `/onboarding?redirect=${encodeURIComponent(callbackURL)}`,
    });

    if (error) {
      toast.error("Sign in failed", { description: error.message });
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={handleClick}
    >
      <GoogleIcon className="h-4 w-4" />
      Continue with Google
    </Button>
  );
}
