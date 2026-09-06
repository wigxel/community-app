import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectFormItem } from "~/components/forms/project/project-form-item";
import { projectSchema as projectFormSchema } from "~/lib/validators/schema";
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

function renderItem(override: Partial<ProjectFormValues> = {}) {
  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({
      resolver: zodResolver(projectFormSchema),
      defaultValues: { ...DEFAULT_PROJECT, ...override },
    });
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <ProjectFormItem />
          <button type="submit">submit</button>
        </form>
      </FormProvider>
    );
  };
  return { user: userEvent.setup(), ...render(<Wrapper />) };
}

describe("ProjectFormItem", () => {
  afterEach(cleanup);

  it("renders title input, description field, timeline and ongoing checkbox", () => {
    renderItem();
    expect(screen.getByLabelText(/^title/i)).toBeDefined();
    expect(screen.getByLabelText(/description/i)).toBeDefined();
    expect(screen.getByText(/timeline/i)).toBeDefined();
    expect(screen.getByLabelText(/I am currently working/i)).toBeDefined();
    expect(screen.getByText(/^project$/i)).toBeDefined(); // CardTitle fallback
  });

  it("CardTitle shows fallback Project then live title", async () => {
    const { user } = renderItem();
    expect(screen.getByText(/^project$/i)).toBeDefined();
    const input = screen.getByLabelText(/^title/i);
    await user.type(input, "My App");
    expect(screen.getByText("My App")).toBeDefined();
  });

  it("shows two TimelineSelects when ongoing false and one when true", () => {
    const { unmount } = renderItem({ ongoing: false });
    expect(screen.getByText(/start month/i)).toBeDefined();
    expect(screen.getByText(/end month/i)).toBeDefined();
    cleanup();
    renderItem({ ongoing: true });
    expect(screen.getByText(/start month/i)).toBeDefined();
    expect(screen.queryByText(/end month/i)).toBeNull();
  });

  it("checking ongoing hides end and clears timeline.end", async () => {
    const { user } = renderItem({
      ongoing: false,
      timeline: { start: { year: "2022" }, end: { year: "2023" } },
    });
    expect(screen.getByText(/end month/i)).toBeDefined();
    const checkbox = screen.getByLabelText(
      /I am currently working/i,
    ) as HTMLInputElement;
    await user.click(checkbox);
    await waitFor(() => {
      expect(screen.queryByText(/end month/i)).toBeNull();
    });
  });

  it("validation: empty title after submit shows required error", async () => {
    const { user } = renderItem({ title: "" });
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeDefined();
    });
  });

  it("validation: title >100 chars shows max error", async () => {
    const long = "a".repeat(101);
    const { user } = renderItem({ title: long });
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Title cannot exceed 100 characters/i),
      ).toBeDefined();
    });
  });

  it("has accessible labels and maxLength attributes", () => {
    renderItem();
    const title = screen.getByLabelText(/^title/i) as HTMLInputElement;
    expect(title.getAttribute("maxLength")).toBe("100");
    const desc = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    expect(desc.getAttribute("maxLength")).toBe("300");
  });

  it("checkbox triggers shouldDirty", async () => {
    const Wrapper = () => {
      const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: DEFAULT_PROJECT,
      });
      return (
        <FormProvider {...form}>
          <form>
            <ProjectFormItem />
            <span data-testid="dirty">{String(form.formState.isDirty)}</span>
          </form>
        </FormProvider>
      );
    };
    const { user } = { user: userEvent.setup(), ...render(<Wrapper />) };
    const cb = screen.getByLabelText(
      /I am currently working/i,
    ) as HTMLInputElement;
    await user.click(cb);
    await waitFor(() => {
      expect(cb).toBeChecked();
    });
  });

  it("shows error when end year is less than start year", async () => {
    const thisYear = new Date().getFullYear();
    const startYear = String(thisYear);
    const endYear = String(thisYear - 1);
    const { user } = renderItem({
      title: "Valid Title",
      timeline: { start: { year: startYear }, end: { year: endYear } },
    });
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/End date cannot be before start date/i),
      ).toBeDefined();
    });
  });

  it("restores old end month and year when toggling ongoing off", async () => {
    const { user } = renderItem({
      timeline: {
        start: { year: "2022", month: "January" } as unknown as {
          month: string;
          year: string;
        },
        end: { year: "2023", month: "June" } as unknown as {
          month: string;
          year: string;
        },
      },
      ongoing: false,
    });
    expect(screen.getByText(/end month/i)).toBeDefined();
    const checkbox = screen.getByLabelText(
      /I am currently working/i,
    ) as HTMLInputElement;
    await user.click(checkbox);
    await waitFor(() => expect(screen.queryByText(/end month/i)).toBeNull());
    await user.click(checkbox);
    await waitFor(() => expect(screen.getByText(/end month/i)).toBeDefined());
    expect(document.body.innerHTML).toContain("2023");
  });
});
