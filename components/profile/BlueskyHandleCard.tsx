"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "~/convex/_generated/api";

export function BlueskyHandleCard() {
  const profile = useQuery(api.profiles.getProfile);
  const linkHandle = useAction(api.profiles.resolveAndLinkBlueskyHandle);
  const unlinkHandle = useMutation(api.profiles.unlinkBlueskyHandle);

  const [handle, setHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const linkedHandle = profile?.blueskyHandle;

  async function handleLink() {
    if (!handle.trim()) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const normalized = handle.replace(/^@/, "").trim();
      await linkHandle({ handle: normalized });
      setMessage({
        type: "success",
        text: `@${normalized} linked successfully!`,
      });
      setHandle("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Could not verify handle. Please check it and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnlink() {
    setIsLoading(true);
    setMessage(null);
    try {
      await unlinkHandle({});
      setMessage({ type: "success", text: "Bluesky account unlinked." });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to unlink. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-blue-500/10 border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-3">
          <svg
            viewBox="0 0 360 320"
            className="h-5 w-5 fill-sky-400 shrink-0"
            aria-hidden="true"
          >
            <path d="M180 142c-16.3-31.7-60.7-90.8-102-120C46.9 2.8 27.5-1 16 1 5.7 2.7 0 7.8 0 14.5c0 7.2 5.5 13 16 20.5 22.2 15.5 57.3 35.4 76 64.7-22-12.2-56.5-31.2-86-43.7-19.5-8.4-35.5-12-47-12-8.2 0-13 2-15 5.2-2.7 4.5 0 11 9 18.8 16 13.5 46 32.8 79 50.5-25.5-7.5-72-23-106-30.5C-5 83.7-1 101 17 113c17.8 11.7 73 28.2 123.8 30.5C99 156 60.5 172.8 44 183 26.3 194 14 205 14 215.5c0 8.5 7.7 12.5 19 12.5 19 0 53-9.5 82.5-25.7-12 15.5-26.5 39.2-28.5 54C84 272 93.5 280 105 280c14.5 0 30.5-11.5 43-32.5 12.5-21 20-46.5 32-46.5s19.5 25.5 32 46.5c12.5 21 28.5 32.5 43 32.5 11.5 0 21-8 18-24-2-14.8-16.5-38.5-28.5-54C267 218 301 227.5 320 227.5c11.3 0 19-4 19-12.5C339 205 327 194 309 183c-16.5-10.2-55-27-97-32.5C263 148.2 318 131.7 335.8 120c18-12 22-29.3-5.8-25C296 102.5 249.5 119 224 126.5c33-17.7 63-37 79-50.5 9-7.8 11.7-14.3 9-18.8-2-3.2-6.8-5.2-15-5.2-11.5 0-27.5 3.6-47 12-29.5 12.5-64 31.5-86 43.7C182.3 79.4 217.5 59.5 239.7 44 250.2 36.5 255.7 30.7 255.7 23.5c0-6.7-5.7-11.8-16-13.5C228.3-1 209-2.8 282 22c-41.3 29.2-85.7 88.3-102 120z" />
          </svg>
          Bluesky
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "bg-red-500/20 text-red-300 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {linkedHandle ? (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                Linked account
              </p>
              <a
                href={`https://bsky.app/profile/${linkedHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 font-medium hover:underline"
              >
                @{linkedHandle}
              </a>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleUnlink}
              disabled={isLoading}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
            >
              {isLoading ? "Unlinking..." : "Unlink"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-white/60">
              Link your Bluesky account to display a verified profile link.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm select-none">
                  @
                </span>
                <Input
                  placeholder="yourhandle.bsky.social"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="pl-7"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleLink();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleLink}
                disabled={isLoading || !handle.trim()}
              >
                {isLoading ? "Verifying..." : "Link"}
              </Button>
            </div>
            <p className="text-xs text-white/40">
              Your handle will be verified against the ATProto network before
              saving.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
