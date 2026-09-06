import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm, Controller } from "react-hook-form";
import TimelineSelect from "~/components/forms/project/timeline-select";
import type { ProjectFormValues } from "~/components/forms/project/project-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema as projectFormSchema } from "~/lib/validators/schema";

const DEFAULTS: ProjectFormValues = {
  userId: "",
  title: "Test",
  description: "",
  timeline: {
    start: {
      month: "January",
      year: String(new Date().getFullYear() - 1),
    } as unknown as ProjectFormValues["timeline"]["start"],
    end: null,
  },
  ongoing: false,
  media: [],
  link: [],
};

function renderWithForm(defaults: Partial<ProjectFormValues> = {}) {
  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({
      resolver: zodResolver(projectFormSchema),
      defaultValues: { ...DEFAULTS, ...defaults },
    });
    return (
      <FormProvider {...form}>
        <form>
          <Controller
            control={form.control}
            name="timeline.start"
            render={({ field }) => (
              <TimelineSelect
                timeline="start"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </form>
      </FormProvider>
    );
  };
  return { user: userEvent.setup(), ...render(<Wrapper />) };
}

describe("TimelineSelect isolated", () => {
  afterEach(cleanup);
  it("reads default value from form provider and shows it", async () => {
    const y = String(new Date().getFullYear() - 1);
    renderWithForm({
      timeline: {
        start: {
          month: "January",
          year: y,
        } as unknown as ProjectFormValues["timeline"]["start"],
        end: null,
      },
    });
    // Label should exist
    expect(screen.getByText(/Start month/i)).toBeDefined();
    expect(screen.getByText(/Start year/i)).toBeDefined();
    // The Select trigger should show the default month/year
    // For shadcn Select, the trigger's text is the selected value
    await waitFor(() => {
      const triggers = screen.getAllByRole("combobox");
      expect(triggers[0].textContent).toContain("January");
      expect(triggers[1].textContent).toContain(y);
    });
  });
  it("shows placeholder when value is null", () => {
    renderWithForm({ timeline: { start: null, end: null } });
    const triggers = screen.getAllByRole("combobox");
    expect(triggers[0].textContent).toContain("Select Month");
    expect(triggers[1].textContent).toContain("Select Year");
  });
});
