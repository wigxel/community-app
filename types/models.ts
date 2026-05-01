export interface Profile {
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

interface Link {
  tag: string; // eg linkedin, github, website
  value: string; // https://linkedin.com
  title: string; // LinkedIn
}

interface Project {
  title: string;
  timeline: {
    start: number;
    end: number;
  };
  description: string;
  media: Media[];
  link?: string[];
}

interface Media {
  type: "photo" | "pdf" | "video";
  metadata: Record<string, unknown>;
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
