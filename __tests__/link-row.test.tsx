import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import LinkRow, { extractLinkValue } from "~/components/forms/project/link-row";
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

function renderLinkRow() {
  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({
      defaultValues: {
        ...DEFAULT_PROJECT,
        link: [{ tag: "other", value: "" }],
      },
    });
    return (
      <FormProvider {...form}>
        <LinkRow
          linkIndex={0}
          control={form.control}
          remove={vi.fn()}
          error={undefined}
        />
      </FormProvider>
    );
  };
  return render(<Wrapper />);
}

function pasteInto(input: HTMLElement, text: string) {
  fireEvent.paste(input, {
    clipboardData: {
      getData: () => text,
      types: ["text/plain"],
    },
  });
}

describe("extractLinkValue", () => {
  it("returns full GitHub URL", () => {
    expect(extractLinkValue("https://github.com/user/repo")).toBe(
      "https://github.com/user/repo",
    );
  });

  it("returns full Figma URL", () => {
    expect(extractLinkValue("https://figma.com/file/abc123/design")).toBe(
      "https://figma.com/file/abc123/design",
    );
  });

  it("returns full LinkedIn URL", () => {
    expect(extractLinkValue("https://linkedin.com/in/johndoe")).toBe(
      "https://linkedin.com/in/johndoe",
    );
  });

  it("returns full Behance URL", () => {
    expect(extractLinkValue("https://behance.net/gallery/12345")).toBe(
      "https://behance.net/gallery/12345",
    );
  });

  it("preserves query params", () => {
    expect(extractLinkValue("https://github.com/user/repo?tab=readme")).toBe(
      "https://github.com/user/repo?tab=readme",
    );
  });

  it("preserves hash", () => {
    expect(extractLinkValue("https://figma.com/file/abc#frame")).toBe(
      "https://figma.com/file/abc#frame",
    );
  });

  it("returns null for non-matching hosts", () => {
    expect(extractLinkValue("https://example.com/page")).toBeNull();
  });

  it("returns null for invalid URLs", () => {
    expect(extractLinkValue("not-a-url")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractLinkValue("")).toBeNull();
  });

  it("handles URLs with www prefix", () => {
    expect(extractLinkValue("https://www.github.com/user/repo")).toBe(
      "https://www.github.com/user/repo",
    );
  });

  it("handles URLs without protocol", () => {
    expect(extractLinkValue("github.com/user/repo")).toBeNull();
  });
});

describe("LinkRow paste interaction", () => {
  it("stores full GitHub URL on paste", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox");
    pasteInto(input, "https://github.com/user/repo");
    expect(input).toHaveValue("https://github.com/user/repo");
  });

  it("stores full Figma URL on paste", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox");
    pasteInto(input, "https://figma.com/file/abc123");
    expect(input).toHaveValue("https://figma.com/file/abc123");
  });

  it("stores full LinkedIn URL on paste", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox");
    pasteInto(input, "https://linkedin.com/in/johndoe");
    expect(input).toHaveValue("https://linkedin.com/in/johndoe");
  });

  it("stores full Behance URL on paste", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox");
    pasteInto(input, "https://behance.net/gallery/123");
    expect(input).toHaveValue("https://behance.net/gallery/123");
  });

  it("does not call preventDefault for non-matching URL", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox");
    const preventDefault = vi.fn();
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "https://example.com/page",
        types: ["text/plain"],
      },
      preventDefault,
    });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("does not call preventDefault for plain text", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox");
    const preventDefault = vi.fn();
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "hello world",
        types: ["text/plain"],
      },
      preventDefault,
    });
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
