import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaxonomySection } from "~/components/forms/project/taxonomy-section";
import type { ProjectFormValues } from "~/components/forms/project/project-form";

const { mockUseQuery } = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));
vi.mock("hooks-ts", () => ({
  useDebounce: (value: unknown) => value,
}));

const DEFAULT_PROJECT: ProjectFormValues = {
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
  tags: [],
};

function renderSection(initialTags: string[] = []) {
  const user = userEvent.setup();

  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({
      defaultValues: { ...DEFAULT_PROJECT, tags: initialTags },
    });
    const tags = useWatch({ control: form.control, name: "tags" });

    return (
      <FormProvider {...form}>
        <TaxonomySection />
        <output data-testid="tags">{tags.join(",")}</output>
      </FormProvider>
    );
  };

  return { user, ...render(<Wrapper />) };
}

function getTagInput() {
  return screen.getByRole("combobox", { name: "Add a tag" });
}

describe("TaxonomySection", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("adds a typed tag when Enter is pressed", async () => {
    const { user } = renderSection();

    await user.type(getTagInput(), "UI Design{Enter}");

    expect(screen.getByTestId("tags")).toHaveTextContent("UI Design");
    expect(getTagInput()).toHaveValue("");
  });

  it("adds a tag when comma is pressed", async () => {
    const { user } = renderSection();

    await user.type(getTagInput(), "React,");

    expect(screen.getByTestId("tags")).toHaveTextContent("React");
  });

  it("shows skill suggestions and adds the selected one", async () => {
    mockUseQuery.mockReturnValue(["React", "React Native"]);
    const { user } = renderSection();

    await user.type(getTagInput(), "re");

    const option = await screen.findByRole("option", { name: "React" });
    await user.click(option);

    expect(screen.getByTestId("tags")).toHaveTextContent("React");
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ q: "re" }),
    );
  });

  it("rejects duplicate tags case-insensitively", async () => {
    const { user } = renderSection(["React"]);

    await user.type(getTagInput(), "react{Enter}");

    expect(screen.getByTestId("tags")).toHaveTextContent("React");
    expect(screen.getByText(/"react" is already added\./)).toBeInTheDocument();
  });

  it("removes a tag from its chip", async () => {
    const { user } = renderSection(["React", "Design"]);

    await user.click(screen.getByRole("button", { name: "Remove React" }));

    expect(screen.getByTestId("tags")).toHaveTextContent("Design");
    expect(screen.getByTestId("tags")).not.toHaveTextContent("React");
  });

  it("disables the input at the maximum of 8 tags", () => {
    renderSection(Array.from({ length: 8 }, (_, index) => `tag-${index}`));

    expect(getTagInput()).toBeDisabled();
    expect(
      screen.getByPlaceholderText("Maximum of 8 tags reached"),
    ).toBeInTheDocument();
  });

  it("shows a hint for tags longer than 32 characters", async () => {
    const { user } = renderSection();

    await user.type(getTagInput(), `${"a".repeat(33)}{Enter}`);

    expect(
      screen.getByText("Tags cannot exceed 32 characters."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("tags")).toBeEmptyDOMElement();
  });

  it("suggests adding the typed value when there are no skill matches", async () => {
    const { user } = renderSection();

    await user.type(getTagInput(), "custom");

    await waitFor(() => {
      expect(
        screen.getByText("Press Enter to add “custom”"),
      ).toBeInTheDocument();
    });
  });
});
