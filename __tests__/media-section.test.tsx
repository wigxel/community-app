import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { MediaSection } from "~/components/forms/project/media-section";
import { pendingFiles } from "~/components/forms/project/media-row";
import type { ProjectFormValues } from "~/components/forms/project/project-form";

const DEFAULT_PROJECT: ProjectFormValues = {
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
};

function renderSection(override: Partial<ProjectFormValues> = {}) {
  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({
      defaultValues: { ...DEFAULT_PROJECT, ...override },
    });
    return (
      <FormProvider {...form}>
        <MediaSection />
      </FormProvider>
    );
  };
  return { user: userEvent.setup(), ...render(<Wrapper />) };
}

describe("MediaSection", () => {
  afterEach(() => {
    cleanup();
    pendingFiles.clear();
  });

  it("renders empty state when no media", () => {
    renderSection();
    expect(screen.getByText(/No media added yet/i)).toBeDefined();
    expect(screen.getByText(/^Media$/)).toBeDefined();
  });

  it("clicking Add media appends a row", async () => {
    const { user } = renderSection();
    expect(screen.getByText(/No media added yet/i)).toBeDefined();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    await waitFor(() => {
      expect(
        document.querySelector('input[placeholder="Title (optional)"]'),
      ).not.toBeNull();
    });
    expect(screen.queryByText(/No media added yet/i)).toBeNull();
    expect(screen.getByText(/Click to upload/i)).toBeDefined();
  });

  it("removing media row brings back empty state", async () => {
    const { user } = renderSection();
    await user.click(screen.getByRole("button", { name: /Add media/i }));
    expect(
      await screen.findByPlaceholderText(/Title \(optional\)/i),
    ).toBeDefined();
    const trash = document.querySelector(
      'button[class*="hover:bg-red"]',
    ) as HTMLElement;
    expect(trash).toBeDefined();
    await user.click(trash);
    expect(await screen.findByText(/No media added yet/i)).toBeDefined();
  });

  it("disables Add media and shows Max of 10 when at limit", () => {
    const media = Array.from({ length: 10 }, (_, i) => ({
      type: "photo" as const,
      metadata: {
        url: "",
        filename: `f${i}.jpg`,
        mimeType: "image/jpeg",
        size: 100,
        width: 10,
        height: 10,
      },
    }));
    renderSection({ media } as unknown as Partial<ProjectFormValues>);
    const btn = screen.getByRole("button", {
      name: /Max of 10/i,
    }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(screen.getByText(/Maximum 10 media reached/i)).toBeDefined();
  });
});
