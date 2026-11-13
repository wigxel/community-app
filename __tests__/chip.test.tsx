import { render, screen } from "@testing-library/react";
import { Chip } from "~/components/ui/chip";

describe("Chip", () => {
  it("renders the label", () => {
    render(<Chip label="TypeScript" />);

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("wraps the icon in a spaced trailing slot", () => {
    render(<Chip label="Tag" icon={<svg data-testid="icon" />} />);

    expect(screen.getByTestId("icon").parentElement).toHaveClass("ms-2");
  });

  it("omits the trailing slot when there is no icon", () => {
    const { container } = render(<Chip label="Tag" />);

    expect(container.querySelector(".ms-2")).not.toBeInTheDocument();
  });

  it("applies the default variant", () => {
    render(<Chip label="Tag" />);

    expect(screen.getByText("Tag")).toHaveClass("text-foreground");
  });

  it.each([
    ["highlighted", "border-brand-primary"],
    ["muted", "bg-muted"],
    ["ghost", "text-transparent"],
  ] as const)("applies the %s variant", (variant, expectedClass) => {
    render(<Chip label="Tag" variant={variant} />);

    expect(screen.getByText("Tag")).toHaveClass(expectedClass);
  });

  it("merges custom classes", () => {
    render(<Chip label="Tag" className="custom-class" />);

    expect(screen.getByText("Tag")).toHaveClass("custom-class");
  });

  it("forwards span attributes", () => {
    render(<Chip label="Tag" aria-label="tag chip" title="tooltip" />);

    const chip = screen.getByLabelText("tag chip");
    expect(chip).toHaveAttribute("title", "tooltip");
    expect(chip.tagName).toBe("SPAN");
  });
});
