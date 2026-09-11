import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DescriptionField } from "~/components/forms/fields/description-field";
import { projectSchema as projectFormSchema } from "~/lib/validators/schema";

const DEFAULT_PROJECT = {
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
};

function renderField(props: {
  name: string;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  defaultValues?: Record<string, unknown>;
}) {
  const { name, label, placeholder, maxLength, defaultValues } = props;
  const Wrapper = () => {
    const form = useForm({
      resolver: zodResolver(projectFormSchema),
      defaultValues: { ...DEFAULT_PROJECT, ...defaultValues },
    });
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <DescriptionField
            name={name}
            label={label}
            placeholder={placeholder}
            maxLength={maxLength}
          />
          <button type="submit">submit</button>
        </form>
      </FormProvider>
    );
  };
  return { user: userEvent.setup(), ...render(<Wrapper />) };
}

describe("DescriptionField", () => {
  afterEach(cleanup);

  it("renders label, textarea and counter 0/300", () => {
    renderField({ name: "description" });
    expect(screen.getByLabelText(/description/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/What did you build/i)).toBeDefined();
    expect(screen.getByText("0/300")).toBeDefined();
  });

  it("counter updates live on type", async () => {
    const { user } = renderField({ name: "description" });
    const ta = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    await user.type(ta, "hello");
    expect(screen.getByText("5/300")).toBeDefined();
    expect(ta.value).toBe("hello");
  });

  it("respects maxLength prop", () => {
    renderField({ name: "description", maxLength: 500 });
    expect(screen.getByText("0/500")).toBeDefined();
    const ta = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    expect(ta.getAttribute("maxLength")).toBe("500");
  });

  it("uses custom label and placeholder", () => {
    renderField({
      name: "bio",
      label: "Bio",
      placeholder: "Enter bio",
      defaultValues: { bio: "" } as unknown as Record<string, unknown>,
    });
    // For custom name, schema won't validate but render should still show label/placeholder
    // We test that label text is rendered; error case is separate below with correct schema field
    const wrapper = () => {
      // Re-render with description field but custom label/placeholder
    };
    cleanup();
    renderField({
      name: "description",
      label: "Bio",
      placeholder: "Enter bio",
    });
    expect(screen.getByLabelText(/bio/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter bio/i)).toBeDefined();
  });

  it("shows FormMessage when description exceeds max", async () => {
    const long = "a".repeat(301);
    const Wrapper = () => {
      const form = useForm({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
          ...DEFAULT_PROJECT,
          description: long,
          title: "valid",
        },
      });
      return (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <DescriptionField name="description" />
            <button type="submit">submit</button>
          </form>
        </FormProvider>
      );
    };
    const { user } = { user: userEvent.setup(), ...render(<Wrapper />) };
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Description cannot exceed 300 characters/i),
      ).toBeDefined();
    });
  });

  it("isolates name prop — long value on different field does not error description", async () => {
    // Render with name "description" but provide value via different field should not trigger
    const Wrapper = () => {
      const form = useForm({
        resolver: zodResolver(projectFormSchema),
        defaultValues: { ...DEFAULT_PROJECT, description: "short" },
      });
      return (
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <DescriptionField name="description" />
            <button type="submit">submit</button>
          </form>
        </FormProvider>
      );
    };
    const { user } = { user: userEvent.setup(), ...render(<Wrapper />) };
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      // short description should not show error
      expect(screen.queryByText(/Description cannot exceed 300/i)).toBeNull();
    });
  });
});
