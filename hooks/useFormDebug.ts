"use client";

import { useEffect } from "react";
import type { FieldErrors, FieldValues, UseFormReturn } from "react-hook-form";
import { logger } from "~/config/logger";

const log = logger.withTag("form-debug");

/** Collects the paths of fields with a validation message, including nested ones. */
export function collectFailedFields(errors: unknown, prefix = ""): string[] {
  if (!errors || typeof errors !== "object") return [];

  return Object.entries(errors).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && "message" in value) return [path];
    return collectFailedFields(value, path);
  });
}

export function useFormDebug<T extends FieldValues>(form: UseFormReturn<T>) {
  const { subscribe } = form;

  useEffect(
    () =>
      subscribe({
        formState: { errors: true },
        callback: ({ errors }) => {
          const failed = collectFailedFields(errors as FieldErrors<T>);
          if (failed.length) log.info("invalid fields:", failed);
        },
      }),
    [subscribe],
  );
}
