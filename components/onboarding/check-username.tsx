"use client";

import { useQuery } from "convex/react";
import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/convex/_generated/api";
import { validateUsernameFormat } from "~/lib/username";

export type UsernameStatus = "idle" | "checking" | "available" | "invalid";
export type CheckUsernameProps = {
  value: string;
  onChange: (value: string) => void;
  onStatusChange: (status: UsernameStatus) => void;
};
export function CheckUsername(props: CheckUsernameProps) {
  const { value, onChange, onStatusChange } = props;

  const trimmedUsername = value.trim().toLowerCase();
  const formatError = trimmedUsername
    ? validateUsernameFormat(trimmedUsername)
    : null;

  const [debouncedUsername, setDebouncedUsername] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedUsername(trimmedUsername), 400);
    return () => clearTimeout(id);
  }, [trimmedUsername]);

  const shouldCheck =
    debouncedUsername.length > 0 && !validateUsernameFormat(debouncedUsername);
  const availability = useQuery(
    api.profiles.checkUsernameAvailability,
    shouldCheck ? { username: debouncedUsername } : "skip",
  );

  const isChecking =
    !formatError &&
    trimmedUsername.length > 0 &&
    (debouncedUsername !== trimmedUsername || availability === undefined);
  const isAvailable =
    debouncedUsername === trimmedUsername && availability?.available === true;
  const errorMessage =
    formatError ??
    (availability && !availability.available ? availability.reason : null);

  const status: UsernameStatus =
    trimmedUsername.length === 0
      ? "idle"
      : isChecking
        ? "checking"
        : isAvailable
          ? "available"
          : "invalid";

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <Input
          id="username"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="janedoe"
          aria-invalid={Boolean(errorMessage)}
          className={
            errorMessage
              ? "border-red-500/50 pr-9"
              : isAvailable
                ? "border-green-500/50 pr-9"
                : "pr-9"
          }
        />
        {trimmedUsername.length > 0 && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2">
            {isChecking ? (
              <Loader2 size={16} className="animate-spin text-white/50" />
            ) : isAvailable ? (
              <Check size={16} className="text-green-400" />
            ) : errorMessage ? (
              <X size={16} className="text-red-400" />
            ) : null}
          </span>
        )}
      </div>
      {isChecking ? (
        <p className="text-xs text-white/50">Checking availability…</p>
      ) : errorMessage ? (
        <p className="text-xs text-red-400">{errorMessage}</p>
      ) : isAvailable ? (
        <p className="text-xs text-green-400">Username is available</p>
      ) : (
        <p className="text-xs text-white/50">
          This will be your unique identifier.
        </p>
      )}
    </div>
  );
}
