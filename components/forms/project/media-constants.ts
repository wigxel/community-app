"use client";

import { ACCEPTED_PROJECT_MEDIA_TYPES } from "~/lib/factories/project";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const ACCEPTED_SET = new Set(Object.keys(ACCEPTED_PROJECT_MEDIA_TYPES));
export const ACCEPT_ATTR = Object.keys(ACCEPTED_PROJECT_MEDIA_TYPES).join(",");

export const pendingFiles = new Map<string, File>();
