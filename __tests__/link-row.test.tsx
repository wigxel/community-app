import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import LinkRow, {
  buildLinkUrl,
  detectTagFromUrl,
  extractLinkValue,
  stripToPath,
} from "~/components/forms/project/link-row";
import type { ProjectFormValues } from "~/components/forms/project/project-form";
import type { ProjectLink } from "~/types/models";

const DEFAULT_PROJECT: ProjectFormValues = {
  userId: "",
  title: "",
  description: "",
  timeline: { start: null, end: null },
  ongoing: false,
  media: [],
  link: [],
};

function renderLinkRow(initialTag: ProjectLink["tag"] = "other") {
  const formRef = {
    current: null as ReturnType<typeof useForm<ProjectFormValues>> | null,
  };

  const Wrapper = () => {
    const form = useForm<ProjectFormValues>({
      defaultValues: {
        ...DEFAULT_PROJECT,
        link: [{ tag: initialTag, value: "" }],
      },
    });
    formRef.current = form;
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

  const result = render(<Wrapper />);
  return { form: formRef, ...result };
}

function pasteInto(input: HTMLInputElement, text: string) {
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

describe("detectTagFromUrl", () => {
  it("detects github from github.com URL", () => {
    expect(detectTagFromUrl("https://github.com/user/repo")).toBe("github");
  });

  it("detects github from www.github.com URL", () => {
    expect(detectTagFromUrl("https://www.github.com/user/repo")).toBe("github");
  });

  it("detects figma", () => {
    expect(detectTagFromUrl("https://figma.com/file/abc")).toBe("figma");
  });

  it("detects behance", () => {
    expect(detectTagFromUrl("https://behance.net/gallery/1")).toBe("behance");
  });

  it("returns null for unrecognized host", () => {
    expect(detectTagFromUrl("https://example.com/page")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(detectTagFromUrl("not-a-url")).toBeNull();
  });
});

describe("stripToPath", () => {
  it("strips GitHub URL to path", () => {
    expect(stripToPath("https://github.com/user/repo", "github")).toBe(
      "user/repo",
    );
  });

  it("strips Figma URL to path", () => {
    expect(stripToPath("https://figma.com/file/abc123", "figma")).toBe(
      "file/abc123",
    );
  });

  it("strips Behance URL to path", () => {
    expect(stripToPath("https://behance.net/gallery/123", "behance")).toBe(
      "gallery/123",
    );
  });

  it("preserves query params and hash", () => {
    expect(
      stripToPath("https://github.com/user/repo?tab=readme#install", "github"),
    ).toBe("user/repo?tab=readme#install");
  });

  it("returns as-is for other tag", () => {
    expect(stripToPath("https://example.com/page", "other")).toBe(
      "https://example.com/page",
    );
  });

  it("returns as-is for non-http value", () => {
    expect(stripToPath("user/repo", "github")).toBe("user/repo");
  });
});

describe("buildLinkUrl", () => {
  it("reconstructs GitHub URL", () => {
    expect(buildLinkUrl("github", "user/repo")).toBe(
      "https://github.com/user/repo",
    );
  });

  it("reconstructs Figma URL", () => {
    expect(buildLinkUrl("figma", "file/abc")).toBe(
      "https://figma.com/file/abc",
    );
  });

  it("reconstructs Behance URL", () => {
    expect(buildLinkUrl("behance", "gallery/1")).toBe(
      "https://behance.net/gallery/1",
    );
  });

  it("returns as-is for other tag", () => {
    expect(buildLinkUrl("other", "https://example.com")).toBe(
      "https://example.com",
    );
  });

  it("returns as-is if value already starts with http", () => {
    expect(buildLinkUrl("github", "https://github.com/user/repo")).toBe(
      "https://github.com/user/repo",
    );
  });
});

describe("LinkRow paste interaction", () => {
  it("stores path-only GitHub URL on paste", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://github.com/user/repo");
    expect(input.value).toBe("user/repo");
    expect(screen.getByRole("combobox")).toHaveTextContent("GitHub");
  });

  it("stores path-only Figma URL on paste", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://figma.com/file/abc123");
    expect(input.value).toBe("file/abc123");
    expect(screen.getByRole("combobox")).toHaveTextContent("Figma");
  });

  it("stores path-only Behance URL on paste", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://behance.net/gallery/123");
    expect(input.value).toBe("gallery/123");
    expect(screen.getByRole("combobox")).toHaveTextContent("Behance");
  });

  it("does not call preventDefault for non-matching URL", () => {
    renderLinkRow();
    const input = screen.getByRole("textbox") as HTMLInputElement;
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
    const input = screen.getByRole("textbox") as HTMLInputElement;
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

describe("LinkRow auto-switch interaction", () => {
  it("auto-switches other → github on paste", () => {
    const { form } = renderLinkRow("other");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://github.com/user/repo");
    expect(form.current?.getValues("link.0.tag")).toBe("github");
    expect(input.value).toBe("user/repo");
    expect(screen.getByRole("combobox")).toHaveTextContent("GitHub");
  });

  it("auto-switches other → figma on paste", () => {
    const { form } = renderLinkRow("other");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://figma.com/file/abc123");
    expect(form.current?.getValues("link.0.tag")).toBe("figma");
    expect(input.value).toBe("file/abc123");
    expect(screen.getByRole("combobox")).toHaveTextContent("Figma");
  });

  it("auto-switches other → behance on paste", () => {
    const { form } = renderLinkRow("other");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://behance.net/gallery/123");
    expect(form.current?.getValues("link.0.tag")).toBe("behance");
    expect(input.value).toBe("gallery/123");
    expect(screen.getByRole("combobox")).toHaveTextContent("Behance");
  });

  it("keeps same tag when URL already matches", () => {
    const { form } = renderLinkRow("github");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://github.com/other/repo");
    expect(form.current?.getValues("link.0.tag")).toBe("github");
    expect(input.value).toBe("other/repo");
    expect(screen.getByRole("combobox")).toHaveTextContent("GitHub");
  });

  it("does not auto-switch for unrecognized URL", () => {
    const { form } = renderLinkRow("other");
    const input = screen.getByRole("textbox") as HTMLInputElement;
    pasteInto(input, "https://example.com/page");
    expect(form.current?.getValues("link.0.tag")).toBe("other");
    expect(screen.getByRole("combobox")).toHaveTextContent("Other");
  });
});
