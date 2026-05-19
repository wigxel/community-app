import type { Id } from "~/convex/_generated/dataModel";

export interface ProfileLocation {
  city: string;
  country: string;
}

export interface Profile {
  userId?: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  email: string;
  phoneNumbers: string[];
  username: string;
  title: Title;
  links: Link[];
  shortBio?: string;
  projects?: Project[];
  workExperience?: ProfileWorkExperience[];
  interests?: string[];
  location?: ProfileLocation;
}

export interface ProfileWorkExperience {
  position: string;
  company: string;
  startDate: number;
  endDate?: number | null;
  description?: string;
}

export interface Title {
  name: string;
  description: string | null;
  color?: string;
}

export interface Link {
  tag: string; // eg linkedin, github, website
  value: string; // https://linkedin.com
  title: string; // LinkedIn
}

export interface ProjectLink {
  tag: "github" | "live" | "figma" | "behance" | "docs" | "other";
  value: string;
}

interface BaseMediaMetadata {
  url: string; // filled after cloud upload
  title?: string; // user-supplied label
  filename: string; // uploaded file name
  mimeType: string; // e.g. "image/png"
  size: number; // bytes
  storageId?: string; // Convex storageId after upload
}

type PhotoMedia = {
  type: "photo";
  metadata: BaseMediaMetadata & { width: number; height: number };
};
type VideoMedia = {
  type: "video";
  metadata: BaseMediaMetadata & {
    duration: number;
    width: number;
    height: number;
  };
};
type PdfMedia = { type: "pdf"; metadata: BaseMediaMetadata };

export type Media = PhotoMedia | PdfMedia | VideoMedia;

export type TimelineDate =
  | null
  | { year: string }
  | { month: string; year: string };

export interface Project {
  _id?: Id<"project">;
  userId: string;
  title: string;
  timeline: {
    start: TimelineDate;
    end: TimelineDate;
  };
  ongoing: boolean;
  description: string;
  media: Media[];
  link: ProjectLink[];
}

export interface WorkExperience {
  logo?: string;
  companyName: string;
  location: "remote" | "hybrid" | "onsite";
  type: "contract" | "full-time";
  timeline: {
    start: number;
    end?: number;
  };
  description: string;
  position: string;
}
