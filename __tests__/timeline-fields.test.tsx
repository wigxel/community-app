import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimelineFields } from "~/components/forms/project/project-form-item";
import type { ProjectFormValues } from "~/components/forms/project/project-form";
import { projectSchema as projectFormSchema } from "~/lib/validators/schema";
import { vi } from "vitest";

const DEFAULTS: ProjectFormValues = {
  userId: "",
  title: "Test",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
};

function renderFields(defaults: Partial<ProjectFormValues> = {}) {
  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({
      resolver: zodResolver(projectFormSchema),
      defaultValues: { ...DEFAULTS, ...defaults },
    });
    return (
      <FormProvider {...form}>
        <form>
          <TimelineFields />
        </form>
      </FormProvider>
    );
  };
  return { user: userEvent.setup(), ...render(<Wrapper />) };
}

describe("TimelineFields isolated", () => {
  afterEach(cleanup);

  it("renders start and end with default values on mount", async () => {
    const y1 = String(new Date().getFullYear() - 2);
    const y2 = String(new Date().getFullYear() - 1);
    renderFields({
      timeline: {
        start: {
          month: "January",
          year: y1,
        } as unknown as ProjectFormValues["timeline"]["start"],
        end: {
          month: "June",
          year: y2,
        } as unknown as ProjectFormValues["timeline"]["end"],
      },
      ongoing: false,
    });
    expect(screen.getByText(/Start month/i)).toBeDefined();
    expect(screen.getByText(/End month/i)).toBeDefined();
    await waitFor(() => {
      const triggers = screen.getAllByRole("combobox");
      // 4 triggers: start month, start year, end month, end year
      expect(triggers.length).toBe(4);
      expect(triggers[0].textContent).toContain("January");
      expect(triggers[1].textContent).toContain(y1);
      expect(triggers[2].textContent).toContain("June");
      expect(triggers[3].textContent).toContain(y2);
    });
  });

  it("hides end when ongoing is true on mount", () => {
    renderFields({
      timeline: {
        start: {
          year: String(new Date().getFullYear() - 1),
        } as unknown as ProjectFormValues["timeline"]["start"],
        end: null,
      },
      ongoing: true,
    });
    expect(screen.getByText(/Start month/i)).toBeDefined();
    expect(screen.queryByText(/End month/i)).toBeNull();
  });

  it("shows placeholder when timeline is null", () => {
    renderFields({ timeline: { start: null, end: null } });
    const triggers = screen.getAllByRole("combobox");
    // start month/year should show placeholder
    expect(triggers[0].textContent).toContain("Select Month");
    expect(triggers[1].textContent).toContain("Select Year");
  });

  it("updates when form is reset with new default values", async () => {
    const y1 = String(new Date().getFullYear() - 2);
    const y2 = String(new Date().getFullYear() - 1);
    const Wrapper = () => {
      const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: { ...DEFAULTS, timeline: { start: null, end: null } },
      });
      return (
        <FormProvider {...form}>
          <form>
            <TimelineFields />
            <button
              type="button"
              onClick={() =>
                form.reset({
                  ...DEFAULTS,
                  timeline: {
                    start: {
                      month: "March",
                      year: y1,
                    } as unknown as ProjectFormValues["timeline"]["start"],
                    end: {
                      month: "June",
                      year: y2,
                    } as unknown as ProjectFormValues["timeline"]["end"],
                  },
                })
              }
            >
              reset
            </button>
          </form>
        </FormProvider>
      );
    };
    const { user } = { user: userEvent.setup(), ...render(<Wrapper />) };
    // initially null -> placeholder
    expect(screen.getAllByRole("combobox")[0].textContent).toContain(
      "Select Month",
    );
    await user.click(screen.getByRole("button", { name: "reset" }));
    await waitFor(() => {
      const triggers = screen.getAllByRole("combobox");
      expect(triggers[0].textContent).toContain("March");
      expect(triggers[1].textContent).toContain(y1);
      expect(triggers[2].textContent).toContain("June");
      expect(triggers[3].textContent).toContain(y2);
    });
  });

  it("hydrates from external setValue after mount (simulates Query return)", async () => {
    vi.useFakeTimers();
    const y1 = String(new Date().getFullYear() - 2);
    const y2 = String(new Date().getFullYear() - 1);

    const Wrapper = () => {
      const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: { ...DEFAULTS, timeline: { start: null, end: null } },
      });

      React.useEffect(() => {
        const id = setTimeout(() => {
          form.setValue("timeline.start", {
            month: "February",
            year: y1,
          } as unknown as ProjectFormValues["timeline"]["start"]);
          form.setValue("timeline.end", {
            month: "August",
            year: y2,
          } as unknown as ProjectFormValues["timeline"]["end"]);
        }, 3000);
        return () => clearTimeout(id);
      }, [form]);

      return (
        <FormProvider {...form}>
          <form>
            <TimelineFields />
          </form>
        </FormProvider>
      );
    };

    try {
      render(<Wrapper />);

      expect(screen.getAllByRole("combobox")[0].textContent).toContain(
        "Select Month",
      );
      expect(screen.getAllByRole("combobox")[1].textContent).toContain(
        "Select Year",
      );

      await act(async () => {
        vi.advanceTimersByTime(2999);
      });
      expect(screen.getAllByRole("combobox")[0].textContent).toContain(
        "Select Month",
      );

      await act(async () => {
        vi.advanceTimersByTime(1);
      });

      const triggers = screen.getAllByRole("combobox");
      expect(triggers.length).toBe(4);
      expect(triggers[0].textContent).toContain("February");
      expect(triggers[1].textContent).toContain(y1);
      expect(triggers[2].textContent).toContain("August");
      expect(triggers[3].textContent).toContain(y2);
    } finally {
      vi.useRealTimers();
    }
  });
});
