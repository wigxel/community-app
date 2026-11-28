import { render, screen } from "@testing-library/react";

import { ProfileDetailsSection } from "~/app/(public)/profile/[username]/_components/profile-section";
import type { Profile } from "~/types/models";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    profileImage: null,
    email: "ada@example.com",
    phoneNumbers: [],
    username: "ada",
    title: {
      _id: "title_1",
      name: "Engineer",
      description: null,
    } as unknown as Profile["title"],
    links: [],
    verified: false,
    rateBand: null,
    ...overrides,
  };
}

describe("ProfileDetailsSection", () => {
  it("shows the ranking when a seniority level is set", () => {
    render(
      <ProfileDetailsSection profile={makeProfile({ seniority: "senior" })} />,
    );

    expect(screen.getByText("Ranking")).toBeDefined();
    expect(screen.getByText("Senior")).toBeDefined();
  });

  it("hides the ranking when seniority is none", () => {
    render(
      <ProfileDetailsSection profile={makeProfile({ seniority: "none" })} />,
    );

    expect(screen.queryByText("Ranking")).toBeNull();
  });

  it("hides the ranking when seniority is missing", () => {
    render(<ProfileDetailsSection profile={makeProfile()} />);

    expect(screen.queryByText("Ranking")).toBeNull();
  });
});
