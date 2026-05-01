"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

interface ShareButtonProps {
  username: string;
}

export function ShareButton({ username }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL ||
          "https://community-app-wigxel.vercel.app";
    const profileUrl = `${baseUrl}/profile/${username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 transition-all"
    >
      {copied ? (
        <>
          <Check size={18} className="text-green-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={18} />
          <span>Share Profile</span>
        </>
      )}
    </Button>
  );
}
